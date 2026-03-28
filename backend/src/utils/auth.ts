import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";
const ACCESS_TOKEN_EXPIRATION_SECONDS = 15 * 60;
const REFRESH_TOKEN_LENGTH = 64;
const BCRYPT_SALT_ROUNDS = 10;

export function signToken(payload: Record<string, unknown>, expiresInSeconds = ACCESS_TOKEN_EXPIRATION_SECONDS) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresInSeconds });
}

export function verifyToken(token: string) {
  const payload = jwt.verify(token, JWT_SECRET);
  if (typeof payload === "string") {
    throw new Error("Invalid token payload");
  }
  return payload as Record<string, unknown>;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword);
}

export function generateRefreshToken() {
  return crypto.randomBytes(REFRESH_TOKEN_LENGTH).toString("hex");
}

export async function hashRefreshToken(token: string) {
  return bcrypt.hash(token, BCRYPT_SALT_ROUNDS);
}

export async function verifyRefreshToken(token: string, tokenHash: string) {
  return bcrypt.compare(token, tokenHash);
}
