import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "@/api/base44Client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings] = useState(null);
  const authEventRequestRef = useRef(0);

  const setSignedOutState = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const enrichUser = async (authUser) => {
    if (!authUser) {
      return null;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select(
        "full_name, role, preferred_language, country, city, town, avatar_url, bio"
      )
      .eq("id", authUser.id)
      .maybeSingle();

    if (error) {
      console.error("Failed to load user profile:", error);
    }

    const metadata = authUser.user_metadata || {};

    return {
      ...authUser,
      full_name:
        profile?.full_name ||
        metadata.full_name ||
        metadata.name ||
        authUser.email?.split("@")[0] ||
        "",
      role: profile?.role || "user",
      preferred_language: profile?.preferred_language || "en",
      country: profile?.country || metadata.country || "",
      city: profile?.city || metadata.city || "",
      town: profile?.town || metadata.town || "",
      avatar_url: profile?.avatar_url || metadata.avatar_url || "",
      bio: profile?.bio || "",
    };
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      setIsLoadingAuth(true);
      setAuthError(null);

      const {
        data: { user: currentUser },
        error,
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      // No session is normal for a visitor who has not logged in.
      if (error && error.name !== "AuthSessionMissingError") {
        console.error("User auth check failed:", error);
        setAuthError({
          type: "auth_error",
          message: "Unable to check sign-in status",
        });
      }

      if (currentUser) {
        setUser(await enrichUser(currentUser));
        setIsAuthenticated(true);
      } else {
        setSignedOutState();
      }

      setIsLoadingAuth(false);
      setAuthChecked(true);
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;

      const sessionUser = session?.user ?? null;
      setIsAuthenticated(Boolean(sessionUser));
      setAuthError(null);
      setIsLoadingAuth(false);
      setAuthChecked(true);

      if (!sessionUser) {
        setUser(null);
        return;
      }

      const requestId = ++authEventRequestRef.current;

      void enrichUser(sessionUser).then((enrichedUser) => {
        if (!isMounted || authEventRequestRef.current !== requestId) {
          return;
        }

        setUser(enrichedUser);
      });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const checkUserAuth = async () => {
    setIsLoadingAuth(true);
    setAuthError(null);

    const {
      data: { user: currentUser },
      error,
    } = await supabase.auth.getUser();

    // A missing session is expected before login.
    if (error && error.name !== "AuthSessionMissingError") {
      console.error("User auth check failed:", error);
      setAuthError({
        type: "auth_error",
        message: "Unable to check sign-in status",
      });
    }

    if (currentUser) {
      setUser(await enrichUser(currentUser));
      setIsAuthenticated(true);
    } else {
      setSignedOutState();
    }

    setIsLoadingAuth(false);
    setAuthChecked(true);

    return (await enrichUser(currentUser)) ?? null;
  };

  const checkAppState = () => checkUserAuth();

  const logout = async (shouldRedirect = true) => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout failed:", error);
      return { error };
    }

    setSignedOutState();
    setAuthError(null);

    if (shouldRedirect) {
      window.location.assign("/Login");
    }

    return { error: null };
  };

  const refreshUser = async () => {
    const {
      data: { user: currentUser },
      error,
    } = await supabase.auth.getUser();

    if (error && error.name !== "AuthSessionMissingError") {
      console.error("Silent user refresh failed:", error);
    }

    if (currentUser) {
      const enrichedUser = await enrichUser(currentUser);
      setUser(enrichedUser);
      setIsAuthenticated(true);
      return enrichedUser;
    } else {
      setSignedOutState();
    }

    return null;
  };

  const navigateToLogin = () => {
    window.location.assign("/Login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        appPublicSettings,
        authChecked,
        logout,
        navigateToLogin,
        checkUserAuth,
        checkAppState,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
