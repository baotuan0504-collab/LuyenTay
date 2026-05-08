export class UpdateUserDto {
  name?: string
  username?: string
  avatar?: string
  coverPhoto?: string
  school?: string
  birthday?: string
  relationship?: string
  interests?: string
  hometown?: string
  onboardingCompleted?: boolean
  publicKey?: string

  constructor(data: any) {
    this.name = data.name
    this.username = data.username
    this.avatar = data.avatar || data.profileImage
    this.coverPhoto = data.coverPhoto
    this.school = data.school
    this.birthday = data.birthday
    this.relationship = data.relationship
    this.interests = data.interests
    this.hometown = data.hometown
    this.onboardingCompleted = data.onboardingCompleted
    this.publicKey = data.publicKey
  }

  toUpdateObject() {
    const updateData: any = {}
    Object.keys(this).forEach(key => {
      if ((this as any)[key] !== undefined) {
        updateData[key] = (this as any)[key]
      }
    })
    return updateData
  }
}

export class UserResponseDto {
  id: string
  _id: string
  name: string
  username?: string
  email: string
  avatar: string
  coverPhoto?: string
  school?: string
  birthday?: string
  relationship?: string
  interests?: string
  hometown?: string
  onboardingCompleted?: boolean
  publicKey?: string
  createdAt: string

  constructor(user: any) {
    this.id = user._id.toString()
    this._id = user._id.toString()
    this.name = user.name
    this.username = user.username
    this.email = user.email
    this.avatar = user.avatar
    this.coverPhoto = user.coverPhoto
    this.school = user.school
    this.birthday = user.birthday
    this.relationship = user.relationship
    this.interests = user.interests
    this.hometown = user.hometown
    this.onboardingCompleted = user.onboardingCompleted
    this.publicKey = user.publicKey
    this.createdAt = user.createdAt?.toISOString()
  }
}
