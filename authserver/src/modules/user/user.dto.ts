import { UserEntity } from "../../entities/User"

export class UpdateProfileDto {
  name?: string
  username?: string
  avatar?: string
  school?: string
  hometown?: string
  relationship?: string
  birthday?: string
  interests?: string
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
    if (data.avatar !== undefined) this.avatar = String(data.avatar)
    if (data.school !== undefined) this.school = String(data.school)
    if (data.hometown !== undefined) this.hometown = String(data.hometown)
    if (data.relationship !== undefined) this.relationship = String(data.relationship)
    if (data.birthday !== undefined) this.birthday = String(data.birthday)
    if (data.interests !== undefined) this.interests = String(data.interests)
    if (data.onboardingCompleted !== undefined)
      this.onboardingCompleted = Boolean(data.onboardingCompleted)
  }

  /**
   * OO Logic: DTO tự chịu trách nhiệm áp dụng dữ liệu vào Entity
   */
  public applyTo(user: any): void {
    if (this.name !== undefined) user.name = this.name
    if (this.username !== undefined) user.username = this.username.toLowerCase()
    if (this.avatar !== undefined) user.avatar = this.avatar
    if (this.school !== undefined) user.school = this.school
    if (this.hometown !== undefined) user.hometown = this.hometown
    if (this.relationship !== undefined) user.relationship = this.relationship
    if (this.birthday !== undefined) user.birthday = this.birthday
    if (this.interests !== undefined) user.interests = this.interests
    if (this.onboardingCompleted !== undefined)
      user.onboardingCompleted = this.onboardingCompleted
  }
}

export class UserResponseDto {
  id: string
  name: string
  username: string
  email: string
  avatar: string
  school: string
  hometown: string
  relationship: string
  birthday: string
  interests: string
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
    this.school = String(user.school || "")
    this.hometown = String(user.hometown || "")
    this.relationship = String(user.relationship || "")
    this.birthday = String(user.birthday || "")
    this.interests = String(user.interests || "")
    this.onboardingCompleted = Boolean(user.onboardingCompleted)
    this.createdAt = String(user.createdAt)
  }
}
