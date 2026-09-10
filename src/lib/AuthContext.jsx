import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from '@/api/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings] = useState(null);

  const setSignedOutState = () => {
    setUser(null);
    setIsAuthenticated(false);
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
        setUser(currentUser);
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
      setUser(sessionUser);
      setIsAuthenticated(Boolean(sessionUser));
      setAuthError(null);
      setIsLoadingAuth(false);
      setAuthChecked(true);
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
      setUser(currentUser);
      setIsAuthenticated(true);
    } else {
      setSignedOutState();
    }

    setIsLoadingAuth(false);
    setAuthChecked(true);

    return currentUser ?? null;
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
      setUser(currentUser);
      setIsAuthenticated(true);
    } else {
      setSignedOutState();
    }

    return currentUser ?? null;
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
