import { UserEntity } from "../../entities/User"

export class UpdateProfileDto {
  name?: string
  username?: string
  avatar?: string
  onboardingCompleted?: boolean

  constructor(data: Record<string, unknown>) {
    if (data.name !== undefined) {
      if (String(data.name).length < 2) throw new Error("Name must be at least 2 characters")
      this.name = String(data.name)
    }
    if (data.username !== undefined) {
      if (String(data.username).length < 3) throw new Error("Username must be at least 3 characters")
      this.username = String(data.username)
    }
    if (data.avatar !== undefined) {
      this.avatar = String(data.avatar)
    }
    if (data.onboardingCompleted !== undefined) {
      this.onboardingCompleted = Boolean(data.onboardingCompleted)
    }
  }
}

export class UserResponseDto {
  id: string
  name: string
  username: string
  email: string
  avatar: string
  onboardingCompleted: boolean
  createdAt: string

  constructor(user: UserEntity | Record<string, unknown>) {
    if (!user._id) throw new Error("Invalid user data: missing ID")
    if (!user.name) throw new Error("Invalid user data: missing name")
    if (!user.username) throw new Error("Invalid user data: missing username")
    if (!user.email) throw new Error("Invalid user data: missing email")
    if (!user.avatar) throw new Error("Invalid user data: missing avatar")

    this.id = String(user._id)
    this.name = String(user.name)
    this.username = String(user.username)
    this.email = String(user.email)
    this.avatar = String(user.avatar)
    this.onboardingCompleted = Boolean(user.onboardingCompleted)
    this.createdAt = String(user.createdAt)
  }
}
