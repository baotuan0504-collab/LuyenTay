import NetInfo from "@react-native-community/netinfo"

/**
 * Kiểm tra kết nối mạng hiện tại của thiết bị.
 * Trả về true nếu có mạng, false nếu không.
 */
export async function isNetworkAvailable(): Promise<boolean> {
  try {
    const state = await NetInfo.fetch()
    // Logic mới: 
    // 1. Phải có kết nối vật lý (isConnected)
    // 2. isInternetReachable chỉ chặn nếu nó trả về đúng giá trị 'false' (đã kiểm tra xong và hỏng).
    // Nếu nó trả về 'null', tức là đang kiểm tra, ta vẫn cho qua để tránh lỗi click 2 lần.
    return !!state.isConnected && state.isInternetReachable !== false
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
