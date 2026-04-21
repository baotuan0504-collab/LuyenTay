import NetInfo from "@react-native-community/netinfo"

/**
 * Kiểm tra kết nối mạng hiện tại của thiết bị.
 * Trả về true nếu có mạng, false nếu không.
 */
export async function isNetworkAvailable(): Promise<boolean> {
  try {
    const state = await NetInfo.fetch()
    // Sử dụng isConnected làm chỉ số chính. 
    // isInternetReachable đôi khi trả về null ở lần gọi đầu tiên gây lỗi logic.
    return !!state.isConnected
  } catch {
    return false
  }
}

/**
 * Nếu không có mạng, ném lỗi với message tiếng Việt.
 * Dùng cho các luồng đăng ký/đăng nhập.
 */
export async function requireNetworkOrThrow() {
  const ok = await isNetworkAvailable()
  if (!ok) throw new Error("Vui lòng kiểm tra kết nối internet")
}
