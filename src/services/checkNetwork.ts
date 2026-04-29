import NetInfo from "@react-native-community/netinfo"

/**
 * Kiểm tra kết nối mạng hiện tại của thiết bị.
 * Trả về true nếu có mạng, false nếu không.
 */
export async function isNetworkAvailable(): Promise<boolean> {
  try {
    let state = await NetInfo.fetch()

    // 1. Nếu không có kết nối vật lý (tắt Wifi/4G), báo lỗi ngay
    if (state.isConnected === false) return false

    // 2. Nếu NetInfo xác nhận có Internet, trả về true luôn
    if (state.isInternetReachable === true) return true

    // 3. Trường hợp isInternetReachable là false hoặc null (thường gặp trên Simulator hoặc vừa bật lại mạng)
    // Ta thực hiện một HEAD request thực tế để kiểm tra xem có "thông" mạng thật không.
    // Điều này chính xác hơn việc đợi setTimeout 1.5s.
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2000)

      const response = await fetch("https://www.google.com", {
        method: "HEAD",
        signal: controller.signal,
        cache: "no-store",
      })

      clearTimeout(timeoutId)
      if (response.ok || response.status) {
        return true
      }
    } catch (e) {
      // Nếu ping thất bại, ta kiểm tra lại: Nếu NetInfo cũng xác nhận (isInternetReachable === false)
      // thì chắc chắn là không có mạng, trả về false ngay.
      if (state.isInternetReachable === false) return false
    }

    // 4. Quyết định cuối cùng: 
    // Nếu đến được đây nghĩa là ping thất bại nhưng kết nối vật lý vẫn có (hoặc đang check).
    // Ta trả về true để không chặn người dùng khi Simulator báo null.
    return true
  } catch {
    // Fail-safe: Nếu gặp lỗi trong lúc check, hãy cho phép tiếp tục để không chặn người dùng oan uổng
    return true
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
