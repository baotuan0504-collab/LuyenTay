import NetInfo from "@react-native-community/netinfo"

/**
 * Kiểm tra kết nối mạng hiện tại của thiết bị.
 * Trả về true nếu có mạng, false nếu không.
 */
export async function isNetworkAvailable(): Promise<boolean> {
  try {
    let state = await NetInfo.fetch()

    // 1. Nếu không có kết nối vật lý (tắt Wifi/4G), báo lỗi ngay
    if (!state.isConnected) return false

    // 2. Nếu có kết nối nhưng báo không có Internet (isInternetReachable = false)
    // Trường hợp này hay xảy ra khi vừa bật mạng lại, thư viện chưa kịp cập nhật trạng thái "Reachable"
    if (state.isInternetReachable === false) {
      // Đợi 1.5 giây để thư viện thực hiện ping kiểm tra internet thực tế
      await new Promise((resolve) => setTimeout(resolve, 1500))
      state = await NetInfo.fetch()
    }

    // 3. Sau khi đợi, nếu vẫn báo false thì mới thực sự là không có internet.
    // Nếu là null (đang check) hoặc true thì đều cho qua.
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
