/**
 * Data Transfer Objects cho User Module
 */

export class UpdateProfileDto {
  name?: string
  username?: string
  avatar?: string
  onboardingCompleted?: boolean

  constructor(data: any) {
    this.name = data.name
    this.username = data.username
    this.avatar = data.avatar || data.profileImage
    this.onboardingCompleted = data.onboardingCompleted
  }
}
 
export class UserResponseDto {
  id: string
  name: string
  username?: string
  email: string
  avatar?: string
  onboardingCompleted?: boolean
  createdAt?: string

  constructor(user: any) {
    this.id = user._id.toString()
    this.name = user.name
    this.username = user.username
    this.email = user.email 
    this.avatar = user.avatar
    this.onboardingCompleted = user.onboardingCompleted
    this.createdAt = user.createdAt
  }
}
