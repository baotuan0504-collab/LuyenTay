import type { NextFunction, Response } from "express"
import type { AuthRequest } from "../../../middleware/auth"
import { User } from "../model/user.model"

export async function getUsers(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId
    const users = await User.find({ _id: { $ne: userId } })
      .select("name email avatar")
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

export async function getUserById(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId } = req.params
    const user = await User.findById(userId).select(
      "name email avatar username createdAt",
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
