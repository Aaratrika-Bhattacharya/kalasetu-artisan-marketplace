import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (identifier: string, pass: string) => Promise<void>;
  requestArtisanOtp: (phone: string, lang?: string) => Promise<{ testOtp?: string; message: string }>;
  verifyArtisanOtp: (params: { phoneNumber: string; otp: string; fullName?: string; clusterId?: string }) => Promise<void>;
  logout: () => void;
  isArtisan: boolean;
  isAdmin: boolean;
  isCustomer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('kalasetu_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadSession() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.getMe();
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Session verification failed, logging out:', err);
        logout();
      } finally {
        setIsLoading(false);
      }
    }
    loadSession();
  }, [token]);

  const login = async (identifier: string, pass: string) => {
    const res = await api.login(identifier, pass);
    if (res.success && res.token) {
      localStorage.setItem('kalasetu_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
  };

  const requestArtisanOtp = async (phone: string, lang = 'hi') => {
    return await api.requestArtisanOtp(phone, lang);
  };

  const verifyArtisanOtp = async (params: { phoneNumber: string; otp: string; fullName?: string; clusterId?: string }) => {
    const res = await api.verifyArtisanOtp(params);
    if (res.success && res.token) {
      localStorage.setItem('kalasetu_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
  };

  const logout = () => {
    localStorage.removeItem('kalasetu_token');
    setToken(null);
    setUser(null);
  };

  const isArtisan = user?.role === 'ARTISAN';
  const isAdmin = user?.role === 'ADMIN';
  const isCustomer = user?.role === 'CUSTOMER';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        requestArtisanOtp,
        verifyArtisanOtp,
        logout,
        isArtisan,
        isAdmin,
        isCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
