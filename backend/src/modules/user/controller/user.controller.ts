// Search users by username or name
import type { NextFunction, Response } from "express"
import type { AuthRequest } from "../../../middleware/auth"
import { User } from "../model/user.model"
export async function searchUsers(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { q } = req.query
    if (!q || typeof q !== "string") {
      return res.status(400).json({ message: "Missing search query" })
    }
    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: "i" } },
        { name: { $regex: q, $options: "i" } },
      ],
    })
      .select("name email avatar username publicKey")
      .limit(20)
    res.json(users)
  } catch (error) {
    res.status(500)
    next(error)
  }
}

export async function getUsers(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId
    const users = await User.find({ _id: { $ne: userId } })
      .select("name email avatar publicKey")
      .limit(50)
    res.json(users)
  } catch (error) {
    res.status(500)
    next(error)
  }
}

export async function updateProfile(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId
    const { name, username, profileImage, onboardingCompleted } = req.body
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { name, username, avatar: profileImage, onboardingCompleted } },
      { new: true, runValidators: true },
    ).select("-password")
    if (!user) {
      res.status(404).json({ message: "User not found" })
      return
    }
    res.json(user)
  } catch (error) {
    res.status(500)
    next(error)
  }
}

export async function checkUsername(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { username } = req.params
    const existingUser = await User.findOne({
      username: username,
      _id: { $ne: req.userId },
    })
    res.json({ available: !existingUser })
  } catch (error) {
    res.status(500)
    next(error)
  }
}

export async function updatePublicKey(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId
    const { publicKey } = req.body
    if (!publicKey) {
      return res.status(400).json({ message: "Missing publicKey" })
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { publicKey } },
      { new: true },
    ).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    console.log(`[UserController] Updated publicKey for user ${userId}`);
    res.json(user)
  } catch (error) {
    res.status(500)
    next(error)
  }
}

export async function getUserById(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId } = req.params
    const user = await User.findById(userId).select(
      "name email avatar username publicKey createdAt",
    )
    if (!user) {
      res.status(404).json({ message: "User not found" })
      return
    }
    res.json(user)
  } catch (error) {
    res.status(500)
    next(error)
  }
}
