import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthResponse } from '../types/auth';
import { loginWithGoogleApi, loginLocalApi } from '../api/auth';
import { LoginModal } from '../components/LoginModal';

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

  useEffect(() => {
    // Check if user session exists in localStorage
    const savedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');

    if (savedUser && accessToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
    setIsLoading(false);

    // Listen to global logout event from Axios interceptor
    const handleLogoutEvent = () => {
      logout();
    };

    window.addEventListener('auth_logout', handleLogoutEvent);
    return () => {
      window.removeEventListener('auth_logout', handleLogoutEvent);
    };
  }, []);

  const handleAuthSuccess = (data: AuthResponse) => {
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
  };

  const loginWithGoogle = async (idToken: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const data = await loginWithGoogleApi(idToken);
      handleAuthSuccess(data);
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const loginLocal = async (email: string, password: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const data = await loginLocalApi(email, password);
      handleAuthSuccess(data);
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
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
    </AuthContext.Provider>
  );
};
