import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "zxcvbnmzzz190@gmail.com",
    pass: "iwqi oius gfez vkqa",
  },
})

export async function sendOtpMail(to: string, otp: string) {
  const mailOptions = {
    from: "Nhà phát triển",
    to,
    subject: "Your OTP Code",
    text: `Your OTP code is: ${otp}`,
  }
  await transporter.sendMail(mailOptions)
}

export function generateOtp(length = 6) {
  let otp = ""
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10)
  }
  return otp
}
