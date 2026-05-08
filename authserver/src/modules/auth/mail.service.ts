import nodemailer from "nodemailer";

export interface IMailService {
  sendOtpMail(to: string, otp: string): Promise<void>;
  generateOtp(length?: number): string;
}

export class MailService implements IMailService {
  private transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "zxcvbnmzzz190@gmail.com",
      pass: "iwqi oius gfez vkqa",
    },
  });

  async sendOtpMail(to: string, otp: string): Promise<void> {
    const mailOptions = {
      from: "Nhà phát triển",
      to,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${otp}`,
    };
    await this.transporter.sendMail(mailOptions);
  }

  generateOtp(length = 6): string {
    let otp = "";
    for (let i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10);
    }
    return otp;
  }
}
