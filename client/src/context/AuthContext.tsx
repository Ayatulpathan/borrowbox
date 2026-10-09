import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; passwordConfirm?: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User> & { currentPassword?: string; newPassword?: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('borrowbox_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('borrowbox_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      if (!token) {
        setIsLoading(false);
        return;
      }
      const res = await authService.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('borrowbox_user', JSON.stringify(res.user));
      }
    } catch (err) {
      setUser(null);
      setToken(null);
      localStorage.removeItem('borrowbox_user');
      localStorage.removeItem('borrowbox_token');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('borrowbox_token', res.token);
      localStorage.setItem('borrowbox_user', JSON.stringify(res.user));
    }
  };

  const register = async (data: { name: string; email: string; password: string; passwordConfirm?: string; phone?: string }) => {
    const res = await authService.register(data);
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('borrowbox_token', res.token);
      localStorage.setItem('borrowbox_user', JSON.stringify(res.user));
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Ignore network errors on logout
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('borrowbox_token');
    localStorage.removeItem('borrowbox_user');
  };

  const updateProfile = async (data: Partial<User> & { currentPassword?: string; newPassword?: string }) => {
    const res = await authService.updateProfile(data);
    if (res.success && res.user) {
      setUser(res.user);
      localStorage.setItem('borrowbox_user', JSON.stringify(res.user));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
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
