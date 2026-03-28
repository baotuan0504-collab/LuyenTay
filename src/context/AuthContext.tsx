'use client';

import { supabase } from "@/lib/supabase/client";
import { login, register } from "@/services/auth.service";
import { createContext, useContext, useState, type PropsWithChildren } from "react";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (profileData: Record<string, unknown>) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren<{}>) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  const signUp = async (name: string, email: string, password: string) => {
    const data = await register(name, email, password);
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
    if (!user) {
      throw new Error("No authenticated user");
    }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      ...profileData,
    });

    if (error) {
      throw error;
    }
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
