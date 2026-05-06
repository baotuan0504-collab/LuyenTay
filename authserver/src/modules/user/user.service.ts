import { IUserRepository, UserRepository } from "../../repositories/UserRepository"
import { UpdateProfileDto, UserResponseDto } from "./user.dto"
import { IUserService } from "./user.interface"

export class UserService implements IUserService {
  private userRepository: IUserRepository

  constructor(userRepository: IUserRepository = new UserRepository()) {
    this.userRepository = userRepository
  }

  async getAllExcept(userId: string): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findManyExcept(userId, 50)
    return users.map((u) => new UserResponseDto(u))
  }

  async findById(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId)
    if (!user) throw new Error("User not found")
    return new UserResponseDto(user)
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    const updateData: Record<string, unknown> = {}
    if (dto.name !== undefined) updateData.name = dto.name
    if (dto.username !== undefined) updateData.username = dto.username
    if (dto.avatar !== undefined) updateData.avatar = dto.avatar
    if (dto.onboardingCompleted !== undefined)
      updateData.onboardingCompleted = dto.onboardingCompleted

    const user = await this.userRepository.updateById(userId, updateData)
    if (!user) throw new Error("User not found")

    return new UserResponseDto(user)
  }

  async checkUsernameAvailability(
    username: string,
    excludeUserId?: string,
  ): Promise<boolean> {
    const filter: Record<string, unknown> = {
      username: username.toLowerCase(),
    }
    if (excludeUserId) {
      filter._id = { $ne: excludeUserId }
    }

    const existingUser = await this.userRepository.findOne(filter)
    return !existingUser
  }

  async searchUsers(
    query: string,
    excludeUserId: string,
  ): Promise<UserResponseDto[]> {
    const users = await this.userRepository.search(query, excludeUserId, 50)
    return users.map((u) => new UserResponseDto(u as any))
  }
}
