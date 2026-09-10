import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
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

  const setSignedOutState = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const applyUser = useCallback(
    (nextUser) => {
      if (nextUser) {
        setUser(nextUser);
        setIsAuthenticated(true);
      } else {
        setSignedOutState();
      }
    },
    [setSignedOutState]
  );

  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    setAuthError(null);

    if (!supabase) {
      setSignedOutState();
      setAuthError({
        type: 'configuration_error',
        message: 'Authentication is temporarily unavailable.',
      });
      setIsLoadingAuth(false);
      setAuthChecked(true);
      return null;
    }

    try {
      const {
        data: { user: currentUser },
        error,
      } = await supabase.auth.getUser();

      if (error && error.name !== 'AuthSessionMissingError') {
        console.error('User auth check failed:', error);

        setAuthError({
          type: 'auth_error',
          message: 'Unable to check sign-in status.',
        });
      }

      applyUser(currentUser || null);
      return currentUser || null;
    } catch (error) {
      console.error('Unexpected auth check failure:', error);

      setSignedOutState();
      setAuthError({
        type: 'auth_error',
        message: 'Unable to check sign-in status.',
      });

      return null;
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, [applyUser, setSignedOutState]);

  useEffect(() => {
    let isMounted = true;
    let subscription;

    const initializeAuth = async () => {
      if (!supabase) {
        if (isMounted) {
          setSignedOutState();
          setAuthError({
            type: 'configuration_error',
            message: 'Authentication is temporarily unavailable.',
          });
          setIsLoadingAuth(false);
          setAuthChecked(true);
        }
        return;
      }

      try {
        const {
          data: { user: currentUser },
          error,
        } = await supabase.auth.getUser();

        if (!isMounted) return;

        if (error && error.name !== 'AuthSessionMissingError') {
          console.error('User auth check failed:', error);

          setAuthError({
            type: 'auth_error',
            message: 'Unable to check sign-in status.',
          });
        }

        applyUser(currentUser || null);
      } catch (error) {
        if (!isMounted) return;

        console.error('Unexpected auth initialization failure:', error);

        setSignedOutState();
        setAuthError({
          type: 'auth_error',
          message: 'Unable to check sign-in status.',
        });
      } finally {
        if (isMounted) {
          setIsLoadingAuth(false);
          setAuthChecked(true);
        }
      }

      const {
        data: { subscription: authSubscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!isMounted) return;

        applyUser(session?.user || null);
        setAuthError(null);
        setIsLoadingAuth(false);
        setAuthChecked(true);
      });

      subscription = authSubscription;
    };

    initializeAuth();

    return () => {
      isMounted = false;

      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [applyUser, setSignedOutState]);

  const checkAppState = useCallback(() => checkUserAuth(), [checkUserAuth]);

  const logout = useCallback(
    async (shouldRedirect = true) => {
      if (!supabase) {
        setSignedOutState();

        return {
          error: new Error('Authentication is temporarily unavailable.'),
        };
      }

      try {
        const { error } = await supabase.auth.signOut();

        if (error) {
          console.error('Logout failed:', error);
          return { error };
        }

        setSignedOutState();
        setAuthError(null);

        if (shouldRedirect) {
          window.location.assign('/Login');
        }

        return { error: null };
      } catch (error) {
        console.error('Logout failed:', error);
        return { error };
      }
    },
    [setSignedOutState]
  );

  const refreshUser = useCallback(async () => {
    if (!supabase) {
      setSignedOutState();
      return null;
    }

    try {
      const {
        data: { user: currentUser },
        error,
      } = await supabase.auth.getUser();

      if (error && error.name !== 'AuthSessionMissingError') {
        console.error('Silent user refresh failed:', error);
      }

      applyUser(currentUser || null);
      return currentUser || null;
    } catch (error) {
      console.error('Silent user refresh failed:', error);
      setSignedOutState();
      return null;
    }
  }, [applyUser, setSignedOutState]);

  const navigateToLogin = useCallback(() => {
    window.location.assign('/Login');
  }, []);

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
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
