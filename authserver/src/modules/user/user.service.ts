import { User } from "../../models/User"
import { UpdateProfileDto, UserResponseDto } from "./user.dto"

export class UserService {
  async getAllExcept(userId: string) {
    const users = await User.find({ _id: { $ne: userId } })
      .select("name email avatar")
      .limit(50)
    return users.map((u) => new UserResponseDto(u))
  }

  async findById(userId: string) {
    const user = await User.findById(userId).select(
      "name email avatar username createdAt",
    )
    if (!user) throw new Error("User not found")
    return new UserResponseDto(user)
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const updateData: any = {}
    if (dto.name !== undefined) updateData.name = dto.name
    if (dto.username !== undefined) updateData.username = dto.username
    if (dto.avatar !== undefined) updateData.avatar = dto.avatar
    if (dto.onboardingCompleted !== undefined)
      updateData.onboardingCompleted = dto.onboardingCompleted

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true },
    ).select("-password")

    if (!user) throw new Error("User not found")
    return new UserResponseDto(user)
  }

  async checkUsernameAvailability(username: string, excludeUserId?: string) {
    const existingUser = await User.findOne({
      username: username,
      _id: { $ne: excludeUserId },
    })
    return !existingUser
  }

  async searchUsers(query: string, excludeUserId: string) {
    const searchRegex = query ? { $regex: query, $options: "i" } : { $exists: true }
    const users = await User.find({
      _id: { $ne: excludeUserId },
      $or: [{ name: searchRegex }, { username: searchRegex }],
    })
      .select("name username avatar")
      .limit(50)
    return users.map((u) => new UserResponseDto(u))
  }
}
