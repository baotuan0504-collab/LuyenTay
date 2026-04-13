// Validation helpers for register forms

export function validateUserInfo({
  firstName,
  lastName,
  birthDate,
  gender,
}: {
  firstName: string
  lastName: string
  birthDate: string
  gender: string
}) {
  if (!firstName.trim() || !lastName.trim() || !birthDate.trim() || !gender) {
    return "Vui lòng nhập đầy đủ thông tin cá nhân."
  }
  // Simple date format check (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    return "Ngày sinh không đúng định dạng YYYY-MM-DD."
  }
  return null
}

export function validateAccountInfo({
  email,
  password,
}: {
  email: string
  password: string
}) {
  if (!email.trim()) {
    return "Vui lòng nhập email."
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return "Email không hợp lệ."
  }
  if (password.length < 3) {
    return "Mật khẩu phải có ít nhất 3 ký tự."
  }
  return null
}

export function validateOtp(otp: string) {
  if (!otp.trim()) {
    return "Vui lòng nhập mã OTP."
  }
  if (otp.length < 4) {
    return "Mã OTP phải có ít nhất 4 ký tự."
  }
  return null
}
