import type { NextFunction, Response } from "express"
import type { AuthRequest } from "../middleware/auth"
import { RefreshToken } from "../models/RefreshToken"
import { User } from "../models/User"
import {
  generateRefreshToken,
  hashPassword,
  signToken,
  verifyPassword,
  verifyRefreshToken
} from "../utils/auth"

const REFRESH_TOKEN_EXPIRE_MS = 30 * 24 * 60 * 60 * 1000

const buildUserResponse = (user: any) => ({
  id: user._id.toString(),
  name: user.name,
  username: user.username,
  email: user.email,
  avatar: user.avatar,
  onboardingCompleted: user.onboardingCompleted,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
})

export async function getMe(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId

    const user = await User.findById(userId).select("-password")

    if (!user) {
      res.status(404).json({ message: "User not found" })
      return
    }

    res.status(200).json(buildUserResponse(user))
  } catch (error) {
    res.status(500).json({ message: "Internal server error" })
    next(error)
  }
}

async function createTokenPair(userId: string) {
  const accessToken = signToken({ userId })
  // Lưu accessToken vào database (User model)
  await User.findByIdAndUpdate(userId, {
    $set: { lastAccessToken: accessToken },
  })

  // Lưu refreshToken vào Redis
  const refreshSecret = generateRefreshToken()
  const redis = (await import("../config/redis")).default
  const refreshTokenKey = `refresh:${userId}`
  await redis.set(refreshTokenKey, refreshSecret, "EX", 30 * 24 * 60 * 60) // 30 ngày
  return {
    accessToken,
    refreshToken: refreshSecret,
  }
}

export async function register(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { name = "", email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" })
      return
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      res.status(400).json({ message: "Email already in use" })
      return
    }

    const hashedPassword = await hashPassword(password)

    const newUser = await User.create({
      name: name || "",
      email,
      password: hashedPassword,
    })

    const tokens = await createTokenPair(newUser._id.toString())

    res.status(201).json({ user: buildUserResponse(newUser), ...tokens })
  } catch (error) {
    res.status(500)
    next(error)
  }
}

export async function login(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" })
      return
    }

    const user = await User.findOne({ email })
    if (!user || !(await verifyPassword(password, user.password))) {
      res.status(401).json({ message: "Tài khoản hoặc mật khẩu không đúng" })
      return
    }

    const tokens = await createTokenPair(user._id.toString())

    res.status(200).json({ user: buildUserResponse(user), ...tokens })
  } catch (error) {
    res.status(500)
    next(error)
  }
}

export async function refreshToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) {
      res.status(400).json({ message: "Refresh token is required" })
      return
    }

    const [tokenId, tokenSecret] = String(refreshToken).split(":")
    if (!tokenId || !tokenSecret) {
      res.status(400).json({ message: "Refresh token is invalid" })
      return
    }

    const refreshTokenDoc = await RefreshToken.findById(tokenId)
    if (!refreshTokenDoc || refreshTokenDoc.expiresAt < new Date()) {
      res.status(401).json({ message: "Refresh token expired or invalid" })
      return
    }

    const isValid = await verifyRefreshToken(
      tokenSecret,
      refreshTokenDoc.tokenHash,
    )
    if (!isValid) {
      res.status(401).json({ message: "Refresh token expired or invalid" })
      return
    }

    const userId = refreshTokenDoc.user.toString()
    await refreshTokenDoc.deleteOne()

    const tokens = await createTokenPair(userId)
    res.status(200).json(tokens)
  } catch (error) {
    res.status(500).json({ message: "Internal server error" })
    next(error)
  }
}
