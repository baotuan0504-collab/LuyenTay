"use client"
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

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: PropsWithChildren<{}>) {
  const navigation = useNavigation()
  const route = useRoute()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [isLoggedOut, setIsLoggedOut] = useState(false)

  const STORAGE_KEYS = {
    user: "auth_user",
    accessToken: "auth_accessToken",
    refreshToken: "auth_refreshToken",
  }

  const formatUser = (userData: any): AuthUser | null => {
    if (!userData) return null
    return {
      ...userData,
      id: userData.id || userData._id, // Ưu tiên id, nếu không có thì dùng _id
    }
  }

  useEffect(() => {
    const restoreAuth = async () => {
      try {
        const [storedUser, storedAccessToken, storedRefreshToken] =
          await Promise.all([
            SecureStore.getItemAsync(STORAGE_KEYS.user),
            SecureStore.getItemAsync(STORAGE_KEYS.accessToken),
            SecureStore.getItemAsync(STORAGE_KEYS.refreshToken),
          ])

        if (storedRefreshToken) {
          setRefreshToken(storedRefreshToken)
          try {
            const data = await refreshTokenService(storedRefreshToken)
            setAccessToken(data.accessToken ?? null)
            setRefreshToken(data.refreshToken ?? null)
            setUser(formatUser(data.user))
            await saveAuthState(
              data.user ? formatUser(data.user) : null,
              data.accessToken ?? null,
              data.refreshToken ?? null,
            )
            // Nếu có user và KHÔNG ở Home thì chuyển về Home
            if (
              data.user &&
              navigation &&
              navigation.reset &&
              route?.name !== "Home"
            ) {
              navigation.reset({
                index: 0,
                routes: [{ name: "Home" as never }],
              })
            }
          } catch (err) {
            await signOut()
          }
        } else if (storedUser) {
          setUser(formatUser(JSON.parse(storedUser)))
        } else if (storedAccessToken) {
          setAccessToken(storedAccessToken)
        }
      } catch (error) {
        console.error("Error restoring auth state:", error)
      }
    }
    restoreAuth()
  }, [])

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
    // If requireOtp, do not set user/token yet, just return data
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
    // Đặt cờ logged out ngay lập tức để chặn mọi API call
    setIsLoggedOut(true)
    // Gọi API logout nếu có refreshToken
    if (refreshToken) {
      try {
        await logoutService(refreshToken)
      } catch (e) {
        // Ignore errors, proceed to clear state
      }
    }
    setUser(null)
    setAccessToken(null)
    setRefreshToken(null)
    await saveAuthState(null, null, null)
    // Optionally: add navigation to login screen here if needed
  }

  const updateUser = async (profileData: Record<string, unknown>) => {
    if (!user || !accessToken) {
      throw new Error("No authenticated user")
    }

    const updatedUserRaw = await updateProfileService(profileData, accessToken)
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
      await saveAuthState(
        user,
        data.accessToken ?? null,
        data.refreshToken ?? null,
      )
    } catch (error) {
      // If refresh fails, sign out
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
