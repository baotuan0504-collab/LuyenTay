"use client"
import { setGlobalIsLoggedOut, setTokenUpdateListener } from "@/services/api"
import {
  login,
  logout as logoutService,
  refreshToken as refreshTokenService,
  register,
  verifyLoginOtp as verifyLoginOtpService,
} from "@/services/auth.service"
import { updateProfile as updateProfileService } from "@/services/user.service"
import { useNavigation, useRoute } from "@react-navigation/native"
import * as SecureStore from "expo-secure-store"
import type { PropsWithChildren } from "react"
import { createContext, useContext, useEffect, useState } from "react"

type AuthUser = {
  id: string
  name: string
  username?: string
  email: string
  avatar?: string
  onboardingCompleted?: boolean
  createdAt?: string
  updatedAt?: string
}

type AuthContextValue = {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  updateUser: (profileData: Record<string, unknown>) => Promise<void>
  refreshAccessToken: () => Promise<void>
  verifyLoginOtp: (
    email: string,
    otp: string,
    trustDevice?: boolean,
  ) => Promise<any>
  isLoggedOut: boolean
}

const AuthContext = createContext<
  (AuthContextValue & { isRestoring: boolean }) | undefined
>(undefined)

export function AuthProvider({ children }: PropsWithChildren<{}>) {
  const navigation = useNavigation()
  const route = useRoute()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [isLoggedOut, setIsLoggedOut] = useState(false)
  const [isRestoring, setIsRestoring] = useState(true)

  const STORAGE_KEYS = {
    user: "auth_user",
    accessToken: "auth_accessToken",
    refreshToken: "auth_refreshToken",
  }

  const formatUser = (userData: any): AuthUser | null => {
    if (!userData) return null
    return {
      ...userData,
      id: userData.id || userData._id,
    }
  }

  // Đăng ký listener để nhận update từ api.ts khi token được refresh tự động
  useEffect(() => {
    setTokenUpdateListener(({ accessToken, refreshToken, user }) => {
      console.log("[AuthContext] Syncing token update from API interceptor")
      if (accessToken) setAccessToken(accessToken)
      if (refreshToken) setRefreshToken(refreshToken)
      if (user) setUser(formatUser(user))
    })
  }, [])

  useEffect(() => {
    const restoreAuth = async () => {
      console.log("[AuthContext] restoreAuth starting...");
      setIsRestoring(true);
      try {
        const [storedUser, storedAccessToken, storedRefreshToken] =
          await Promise.all([
            SecureStore.getItemAsync(STORAGE_KEYS.user),
            SecureStore.getItemAsync(STORAGE_KEYS.accessToken),
            SecureStore.getItemAsync(STORAGE_KEYS.refreshToken),
          ]);

        console.log("[AuthContext] Storage check:", {
          hasUser: !!storedUser,
          hasAccess: !!storedAccessToken,
          hasRefresh: !!storedRefreshToken,
        });

        let currentUser: AuthUser | null = null;
        if (storedUser) {
          try {
            currentUser = formatUser(JSON.parse(storedUser));
            console.log("[AuthContext] Parsed user:", currentUser?.email);
            setUser(currentUser);
          } catch (e) {
            console.error("[AuthContext] Error parsing stored user:", e);
          }
        }

        if (storedAccessToken) {
          console.log("[AuthContext] Setting access token");
          setAccessToken(storedAccessToken);
        }

        if (storedRefreshToken) {
          console.log("[AuthContext] Setting refresh token");
          setRefreshToken(storedRefreshToken);
        }

        /**
         * Nếu có refresh token nhưng mất access token (hoặc muốn cập nhật profile mới nhất)
         */
        if (storedRefreshToken && !storedAccessToken) {
          console.log("[AuthContext] Attempting background refresh...");
          try {
            const data = await refreshTokenService(storedRefreshToken);
            setAccessToken(data.accessToken ?? null);
            setRefreshToken(data.refreshToken ?? null);
            const fUser = formatUser(data.user);
            if (fUser) {
              setUser(fUser);
              currentUser = fUser;
            }
            await saveAuthState(
              fUser,
              data.accessToken ?? null,
              data.refreshToken ?? null,
            );
            console.log("[AuthContext] Background refresh success");
          } catch (err) {
            console.warn("[AuthContext] Background refresh failed during restore", err);
          }
        }
      } catch (error) {
        console.error("[AuthContext] Error in restoreAuth:", error);
      } finally {
        setIsRestoring(false);
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
        await SecureStore.setItemAsync(
          STORAGE_KEYS.user,
          JSON.stringify(nextUser),
        )
      } else {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.user)
      }

      if (nextAccessToken) {
        await SecureStore.setItemAsync(
          STORAGE_KEYS.accessToken,
          nextAccessToken,
        )
      } else {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.accessToken)
      }

      if (nextRefreshToken) {
        await SecureStore.setItemAsync(
          STORAGE_KEYS.refreshToken,
          nextRefreshToken,
        )
      } else {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.refreshToken)
      }
    } catch (error) {
      console.error("Error saving auth state:", error)
    }
  }

  const signUp = async (email: string, password: string) => {
    const data = await register(email, password)
    const formattedUser = formatUser(data.user)
    setUser(formattedUser)
    setAccessToken(data.accessToken ?? null)
    setRefreshToken(data.refreshToken ?? null)
    await saveAuthState(
      formattedUser,
      data.accessToken ?? null,
      data.refreshToken ?? null,
    )
  }

  const signIn = async (email: string, password: string) => {
    const data = await login(email, password)
    if (data && data.requireOtp) {
      return data
    }
    const formattedUser = formatUser(data.user)
    setUser(formattedUser)
    setAccessToken(data.accessToken ?? null)
    setRefreshToken(data.refreshToken ?? null)
    await saveAuthState(
      formattedUser,
      data.accessToken ?? null,
      data.refreshToken ?? null,
    )
    return data
  }

  const verifyLoginOtp = async (
    email: string,
    otp: string,
    trustDevice: boolean = false,
  ) => {
    const data = await verifyLoginOtpService(email, otp, trustDevice)
    const formattedUser = formatUser(data.user)
    setUser(formattedUser)
    setAccessToken(data.accessToken ?? null)
    setRefreshToken(data.refreshToken ?? null)
    await saveAuthState(
      formattedUser,
      data.accessToken ?? null,
      data.refreshToken ?? null,
    )
    return data
  }

  const signOut = async () => {
    setIsLoggedOut(true)
    setGlobalIsLoggedOut(true)
    if (refreshToken) {
      try {
        await logoutService(refreshToken)
      } catch (e) {
        // Ignore errors
      }
    }
    setUser(null)
    setAccessToken(null)
    setRefreshToken(null)
    await saveAuthState(null, null, null)
  }

  const updateUser = async (profileData: Record<string, unknown>) => {
    if (!user || !accessToken) {
      throw new Error("No authenticated user")
    }

    const updatedUserRaw = await updateProfileService(profileData)
    const formattedUser = formatUser(updatedUserRaw)
    setUser(formattedUser)
    await saveAuthState(formattedUser, accessToken, refreshToken)
  }

  const refreshAccessToken = async () => {
    if (!refreshToken) {
      throw new Error("No refresh token available")
    }

    try {
      const data = await refreshTokenService(refreshToken)
      setAccessToken(data.accessToken ?? null)
      setRefreshToken(data.refreshToken ?? null)
      const fUser = formatUser(data.user)
      if (fUser) setUser(fUser)
      await saveAuthState(
        fUser || user,
        data.accessToken ?? null,
        data.refreshToken ?? null,
      )
    } catch (error) {
      await signOut()
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        signUp,
        signIn,
        signOut,
        updateUser,
        refreshAccessToken,
        verifyLoginOtp,
        isLoggedOut,
        isRestoring,
      }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
