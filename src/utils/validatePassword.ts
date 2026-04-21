/**
 * Kiểm tra mật khẩu mạnh: ít nhất 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt.
 * Trả về true nếu hợp lệ, false nếu không.
 */
export function validatePassword(password: string): boolean {
  // Regex: ít nhất 8 ký tự, có chữ hoa, chữ thường, số, ký tự đặc biệt
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(
    password,
  )
}
