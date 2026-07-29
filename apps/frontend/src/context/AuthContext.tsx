import React, { createContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthResponse } from '../types/auth';
import { loginWithGoogleApi, loginLocalApi } from '../api/auth';
import { LoginModal } from '../components/LoginModal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { requestAccessTokenRefresh, SESSION_EXPIRED_EVENT } from '../api/client';
import { clearStoredAuth, getRefreshDelayMs } from '../utils/authTokens';

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

  const clearRefreshTimer = () => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  };

  const clearAuthState = () => {
    clearRefreshTimer();
    setUser(null);
    clearStoredAuth();
  };

  useEffect(() => {
    // Check if user session exists in localStorage
    const savedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');

    if (savedUser && accessToken) {
      try {
        setUser(JSON.parse(savedUser));
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
    if (!user) return;

    const scheduleRefresh = () => {
      clearRefreshTimer();
      const delay = getRefreshDelayMs(localStorage.getItem('accessToken'));
      if (delay === null) return;

      refreshTimerRef.current = setTimeout(async () => {
        try {
          await requestAccessTokenRefresh();
          scheduleRefresh();
        } catch {
          // requestAccessTokenRefresh dispatches the session-expired event.
        }
      }, delay);
    };

    scheduleRefresh();
    return clearRefreshTimer;
  }, [user]);

  const handleAuthSuccess = (data: AuthResponse) => {
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
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
