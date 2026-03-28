'use client';

import { login, register } from "@/services/auth.service";
import { updateProfile as updateProfileService } from "@/services/user.service";
import { createContext, useContext, useState, type PropsWithChildren } from "react";

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

  const signUp = async (email: string, password: string) => {
    const data = await register(email, password);
    setUser(data.user);
    setAccessToken(data.accessToken ?? null);
    setRefreshToken(data.refreshToken ?? null);
  };

  const signIn = async (email: string, password: string) => {
    const data = await login(email, password);
    setUser(data.user);
    setAccessToken(data.accessToken ?? null);
    setRefreshToken(data.refreshToken ?? null);
  };

  const signOut = async () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
  };

  const updateUser = async (profileData: Record<string, unknown>) => {
    if (!user || !accessToken) {
      throw new Error("No authenticated user");
    }

    const updatedUser = await updateProfileService(profileData, accessToken);
    setUser(updatedUser);
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
