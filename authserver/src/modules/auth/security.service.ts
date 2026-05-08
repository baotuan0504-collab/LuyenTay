import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import jwt from "jsonwebtoken";

export interface ISecurityService {
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
  signToken(payload: Record<string, unknown>, expiresInSeconds?: number): string;
  verifyToken(token: string): Record<string, unknown>;
  generateRandomString(length?: number): string;
}

export class SecurityService implements ISecurityService {
  private readonly jwtSecret = process.env.JWT_SECRET || "change_this_secret";
  private readonly accessTokenExpiration = 15 * 60;
  private readonly saltRounds = 10;

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  signToken(payload: Record<string, unknown>, expiresInSeconds = this.accessTokenExpiration): string {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: expiresInSeconds });
  }

  verifyToken(token: string): Record<string, unknown> {
    const payload = jwt.verify(token, this.jwtSecret);
    if (typeof payload === "string") {
      throw new Error("Invalid token payload");
    }
    return payload as Record<string, unknown>;
  }

  generateRandomString(length = 64): string {
    return crypto.randomBytes(length).toString("hex");
  }
}
