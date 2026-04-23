import { apiFetch } from "./api"
// @ts-ignore
import { Alert } from "react-native"

export const getMyReaction = async (
  targetId: string,
  targetType: string,
  token: string,
) => {
  try {
    return await apiFetch(
      `/reactions/my?targetId=${targetId}&targetType=${targetType}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
  } catch (error: any) {
    const msg = error?.message || "Đã xảy ra lỗi khi lấy reaction của bạn!"
    try {
      Alert.alert("Lỗi", msg)
    } catch {
      if (typeof window !== "undefined" && window.alert) window.alert(msg)
    }
    return null
  }
}

export const getReactionCounts = async (
  targetId: string,
  targetType: string,
  token?: string,
) => {
  try {
    return await apiFetch(
      `/reactions/counts?targetId=${targetId}&targetType=${targetType}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    )
  } catch (error: any) {
    const msg = error?.message || "Đã xảy ra lỗi khi lấy số lượng reaction!"
    try {
      Alert.alert("Lỗi", msg)
    } catch {
      if (typeof window !== "undefined" && window.alert) window.alert(msg)
    }
    return null
  }
}

export const upsertReaction = async (
  targetId: string,
  targetType: string,
  reactionType: string,
  token: string,
) => {
  try {
    return await apiFetch("/reactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ targetId, targetType, reactionType }),
    })
  } catch (error: any) {
    const msg = error?.message || "Đã xảy ra lỗi khi gửi reaction!"
    try {
      Alert.alert("Lỗi", msg)
    } catch {
      if (typeof window !== "undefined" && window.alert) window.alert(msg)
    }
    return null
  }
}

export const removeReaction = async (
  targetId: string,
  targetType: string,
  token: string,
) => {
  try {
    return await apiFetch(
      `/reactions?targetId=${targetId}&targetType=${targetType}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
  } catch (error: any) {
    const msg = error?.message || "Đã xảy ra lỗi khi xóa reaction!"
    try {
      Alert.alert("Lỗi", msg)
    } catch {
      if (typeof window !== "undefined" && window.alert) window.alert(msg)
    }
    return null
  }
}

export const getReactionUsers = async (
  targetId: string,
  targetType: string,
) => {
  try {
    return await apiFetch(
      `/reactions/users?targetId=${targetId}&targetType=${targetType}`,
    )
  } catch (error: any) {
    const msg =
      error?.message || "Đã xảy ra lỗi khi lấy danh sách user reaction!"
    try {
      Alert.alert("Lỗi", msg)
    } catch {
      if (typeof window !== "undefined" && window.alert) window.alert(msg)
    }
    return null
  }
}
