import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storage';
import { authService } from '../services/authService';
import { socketService } from '../services/socketService';
import { User } from '../types/auth';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (phoneOrEmail: string, password: string) => Promise<void>;
  signup: (payload: {
    fullName: string;
    email?: string;
    phoneNumber: string;
    password: string;
    role: 'farmer' | 'consumer' | 'distributor';
  }) => Promise<void>;
  completeOnboarding: (payload: Record<string, unknown>) => Promise<void>;
  restoreSession: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const persistSession = useCallback(async (nextToken: string, nextUser: User) => {
    setToken(nextToken);
    setUser(nextUser);
    await AsyncStorage.setItem(STORAGE_KEYS.token, nextToken);
    await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(nextUser));
  }, []);

  const restoreSession = useCallback(async () => {
    setLoading(true);
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.token),
        AsyncStorage.getItem(STORAGE_KEYS.user),
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        const parsedUser = JSON.parse(storedUser) as User;
        setUser(parsedUser);
        socketService.connect(parsedUser._id);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
    return () => {
      socketService.disconnect();
    };
  }, [restoreSession]);

  const login = useCallback(
    async (phoneOrEmail: string, password: string) => {
      const response = await authService.login(phoneOrEmail, password);
      await persistSession(response.token, response.user);
      socketService.connect(response.user._id);
    },
    [persistSession]
  );

  const signup = useCallback(
    async (payload: {
      fullName: string;
      email?: string;
      phoneNumber: string;
      password: string;
      role: 'farmer' | 'consumer' | 'distributor';
    }) => {
      const response = await authService.signup(payload);
      await persistSession(response.token, response.user);
      socketService.connect(response.user._id);
    },
    [persistSession]
  );

  const completeOnboarding = useCallback(
    async (payload: Record<string, unknown>) => {
      const response = await authService.completeOnboarding(payload);
      const nextUser = response.user as User;
      setUser(nextUser);
      await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(nextUser));
    },
    []
  );

  const refreshProfile = useCallback(async () => {
    const profile = await authService.getProfile();
    setUser(profile);
    await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(profile));
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem(STORAGE_KEYS.token);
    await AsyncStorage.removeItem(STORAGE_KEYS.user);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      signup,
      completeOnboarding,
      restoreSession,
      refreshProfile,
      logout,
    }),
    [user, token, loading, login, signup, completeOnboarding, restoreSession, refreshProfile, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

