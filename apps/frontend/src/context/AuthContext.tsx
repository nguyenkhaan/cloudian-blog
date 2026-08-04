import React, { createContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthResponse } from '../types/auth';
import { loginWithGoogleApi, loginLocalApi } from '../api/auth';
import { LoginModal } from '../components/LoginModal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { requestAccessTokenRefresh, SESSION_EXPIRED_EVENT } from '../api/client';
import {
  AUTH_SESSION_LIFETIME_MS,
  clearStoredAuth,
  getRefreshDelayMs,
  getStoredSessionExpiresAt,
  isStoredSessionExpired,
  setStoredSessionExpiresAt,
} from '../utils/authTokens';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogle: (idToken: string) => Promise<AuthResponse>;
  loginLocal: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSessionExpiredModalOpen, setIsSessionExpiredModalOpen] = useState(false);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRefreshTimer = () => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  };

  const clearSessionTimer = () => {
    if (sessionTimerRef.current) {
      clearTimeout(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
  };

  const clearAuthState = () => {
    clearRefreshTimer();
    clearSessionTimer();
    setUser(null);
    clearStoredAuth();
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');
    const storedSessionExpiresAt = getStoredSessionExpiresAt();

    if (savedUser && accessToken) {
      try {
        if (storedSessionExpiresAt && storedSessionExpiresAt <= Date.now()) {
          clearStoredAuth();
          setIsSessionExpiredModalOpen(true);
        } else {
          setUser(JSON.parse(savedUser));
          if (!storedSessionExpiresAt) {
            setStoredSessionExpiresAt(Date.now() + AUTH_SESSION_LIFETIME_MS);
          }
        }
      } catch {
        clearStoredAuth();
      }
    }
    setIsLoading(false);

    // Listen to global logout event from Axios interceptor
    const handleLogoutEvent = () => {
      logout();
    };

    const handleSessionExpiredEvent = () => {
      clearAuthState();
      setIsLoginModalOpen(false);
      setIsSessionExpiredModalOpen(true);
    };

    window.addEventListener('auth_logout', handleLogoutEvent);
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpiredEvent);
    return () => {
      window.removeEventListener('auth_logout', handleLogoutEvent);
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpiredEvent);
    };
  }, []);

  useEffect(() => {
    clearRefreshTimer();
    clearSessionTimer();
    if (!user) return;

    const sessionExpiresAt = getStoredSessionExpiresAt();
    if (sessionExpiresAt && sessionExpiresAt <= Date.now()) {
      clearAuthState();
      setIsSessionExpiredModalOpen(true);
      return;
    }

    const effectiveSessionExpiresAt = sessionExpiresAt ?? (Date.now() + AUTH_SESSION_LIFETIME_MS);
    if (!sessionExpiresAt) {
      setStoredSessionExpiresAt(effectiveSessionExpiresAt);
    }

    const scheduleRefresh = () => {
      clearRefreshTimer();
      const delay = getRefreshDelayMs(
        localStorage.getItem('accessToken'),
        effectiveSessionExpiresAt
      );
      if (delay === null) return;

      refreshTimerRef.current = setTimeout(async () => {
        try {
          if (isStoredSessionExpired()) {
            throw new Error('Session expired');
          }
          await requestAccessTokenRefresh();
          scheduleRefresh();
        } catch {
          // requestAccessTokenRefresh dispatches the session-expired event.
        }
      }, delay);
    };

    const timeUntilSessionExpires = Math.max(effectiveSessionExpiresAt - Date.now(), 0);
    sessionTimerRef.current = setTimeout(() => {
      clearAuthState();
      setIsLoginModalOpen(false);
      setIsSessionExpiredModalOpen(true);
    }, timeUntilSessionExpires);

    scheduleRefresh();
    return () => {
      clearRefreshTimer();
      clearSessionTimer();
    };
  }, [user]);

  const handleAuthSuccess = (data: AuthResponse) => {
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setStoredSessionExpiresAt(Date.now() + AUTH_SESSION_LIFETIME_MS);
    setIsSessionExpiredModalOpen(false);
  };

  const loginWithGoogle = async (idToken: string): Promise<AuthResponse> => {
    const data = await loginWithGoogleApi(idToken);
    handleAuthSuccess(data);
    return data;
  };

  const loginLocal = async (email: string, password: string): Promise<AuthResponse> => {
    const data = await loginLocalApi(email, password);
    handleAuthSuccess(data);
    return data;
  };

  const logout = () => {
    clearAuthState();
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        loginWithGoogle,
        loginLocal,
        logout,
        openLoginModal,
        closeLoginModal,
      }}
    >
      {children}
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
      <ConfirmModal
        isOpen={isSessionExpiredModalOpen}
        title="Session Expired"
        description="Your login session has expired. Please sign in again to continue."
        confirmText="Sign In Again"
        cancelText="Stay Logged Out"
        variant="warning"
        onConfirm={() => {
          setIsSessionExpiredModalOpen(false);
          setIsLoginModalOpen(true);
        }}
        onCancel={() => setIsSessionExpiredModalOpen(false)}
      />
    </AuthContext.Provider>
  );
};
