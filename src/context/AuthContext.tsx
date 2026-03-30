'use client';

import { login, register } from "@/services/auth.service";
import { updateProfile as updateProfileService } from "@/services/user.service";
import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";

type AuthUser = {
  id: string;
  name: string;
  username?: string;
  email: string;
  avatar?: string;
  onboardingCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (profileData: Record<string, unknown>) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren<{}>) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  const STORAGE_KEYS = {
    user: "auth_user",
    accessToken: "auth_accessToken",
    refreshToken: "auth_refreshToken",
  };

  useEffect(() => {
    const restoreAuth = async () => {
      try {
        const [storedUser, storedAccessToken, storedRefreshToken] = await Promise.all([
          SecureStore.getItemAsync(STORAGE_KEYS.user),
          SecureStore.getItemAsync(STORAGE_KEYS.accessToken),
          SecureStore.getItemAsync(STORAGE_KEYS.refreshToken),
        ]);

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        if (storedAccessToken) {
          setAccessToken(storedAccessToken);
        }
        if (storedRefreshToken) {
          setRefreshToken(storedRefreshToken);
        }
      } catch (error) {
        console.error("Error restoring auth state:", error);
      }
    };

    restoreAuth();
  }, []);

  const saveAuthState = async (
    nextUser: AuthUser | null,
    nextAccessToken: string | null,
    nextRefreshToken: string | null,
  ) => {
    try {
      if (nextUser) {
        await SecureStore.setItemAsync(STORAGE_KEYS.user, JSON.stringify(nextUser));
      } else {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.user);
      }

      if (nextAccessToken) {
        await SecureStore.setItemAsync(STORAGE_KEYS.accessToken, nextAccessToken);
      } else {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.accessToken);
      }

      if (nextRefreshToken) {
        await SecureStore.setItemAsync(STORAGE_KEYS.refreshToken, nextRefreshToken);
      } else {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.refreshToken);
      }
    } catch (error) {
      console.error("Error saving auth state:", error);
    }
  };

  const signUp = async (email: string, password: string) => {
    const data = await register(email, password);
    setUser(data.user);
    setAccessToken(data.accessToken ?? null);
    setRefreshToken(data.refreshToken ?? null);
    await saveAuthState(data.user, data.accessToken ?? null, data.refreshToken ?? null);
  };

  const signIn = async (email: string, password: string) => {
    const data = await login(email, password);
    setUser(data.user);
    setAccessToken(data.accessToken ?? null);
    setRefreshToken(data.refreshToken ?? null);
    await saveAuthState(data.user, data.accessToken ?? null, data.refreshToken ?? null);
  };

  const signOut = async () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    await saveAuthState(null, null, null);
  };

  const updateUser = async (profileData: Record<string, unknown>) => {
    if (!user || !accessToken) {
      throw new Error("No authenticated user");
    }

    const updatedUser = await updateProfileService(profileData, accessToken);
    setUser(updatedUser);
    await saveAuthState(updatedUser, accessToken, refreshToken);
  };

  return (
    <AuthContext.Provider
      value={{ user, accessToken, refreshToken, signUp, signIn, signOut, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
