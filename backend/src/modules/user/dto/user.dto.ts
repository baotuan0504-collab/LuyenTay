export interface UserResponseDto {
  _id: string
  name: string
  username?: string
  email: string
  avatar: string
  onboardingCompleted?: boolean
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileDto {
  name?: string
  username?: string
  profileImage?: string
  onboardingCompleted?: boolean
}
