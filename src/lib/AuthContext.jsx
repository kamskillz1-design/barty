import React, { createContext, useContext, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      setIsLoadingAuth(true);
      setAuthError(null);

      try {
        const {
          data: { user: currentUser },
          error,
        } = await base44.auth.getUser();

        if (error) {
          throw error;
        }

        if (isMounted) {
          setUser(currentUser);
          setIsAuthenticated(Boolean(currentUser));
        }
      } catch (error) {
        console.error("User auth check failed:", error);

        if (isMounted) {
          setUser(null);
          setIsAuthenticated(false);
          setAuthError({
            type: "auth_required",
            message: "Authentication required",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoadingAuth(false);
          setAuthChecked(true);
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = base44.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) {
        return;
      }

      setUser(session?.user ?? null);
      setIsAuthenticated(Boolean(session?.user));
      setIsLoadingAuth(false);
      setAuthChecked(true);

      if (session?.user) {
        setAuthError(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const checkUserAuth = async () => {
    setIsLoadingAuth(true);
    setAuthError(null);

    try {
      const {
        data: { user: currentUser },
        error,
      } = await base44.auth.getUser();

      if (error) {
        throw error;
      }

      setUser(currentUser);
      setIsAuthenticated(Boolean(currentUser));
      return currentUser;
    } catch (error) {
      console.error("User auth check failed:", error);
      setUser(null);
      setIsAuthenticated(false);
      setAuthError({
        type: "auth_required",
        message: "Authentication required",
      });
      return null;
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  const checkAppState = async () => {
    return checkUserAuth();
  };

  const logout = async (shouldRedirect = true) => {
    const { error } = await base44.auth.signOut();

    if (error) {
      console.error("Logout failed:", error);
      return { error };
    }

    setUser(null);
    setIsAuthenticated(false);
    setAuthError(null);

    if (shouldRedirect) {
      window.location.assign("/Login");
    }

    return { error: null };
  };

  const refreshUser = async () => {
    try {
      const {
        data: { user: currentUser },
        error,
      } = await base44.auth.getUser();

      if (error) {
        throw error;
      }

      setUser(currentUser);
      setIsAuthenticated(Boolean(currentUser));
      return currentUser;
    } catch (error) {
      console.error("Silent user refresh failed:", error);
      return null;
    }
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
