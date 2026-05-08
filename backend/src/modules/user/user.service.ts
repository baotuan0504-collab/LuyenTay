import { IUserRepository, UserRepository } from "../../repositories/UserRepository"
import { UpdateUserDto, UserResponseDto } from "./user.dto"
import { IUserService } from "./user.interface"

export class UserService implements IUserService {
  private userRepository: IUserRepository

  constructor(userRepository: IUserRepository = new UserRepository()) {
    this.userRepository = userRepository
  }

  async getUserById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id)
    if (!user) throw new Error("User not found")
    return new UserResponseDto(user)
  }

  async updateProfile(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const updateData = dto.toUpdateObject()
    const user = await this.userRepository.update(id, updateData)
    if (!user) throw new Error("User not found")
    return new UserResponseDto(user)
  }

  async searchUsers(query: string): Promise<UserResponseDto[]> {
    const users = await this.userRepository.search(query)
    return users.map(u => new UserResponseDto(u))
  }

  async checkUsername(username: string, excludeUserId?: string): Promise<boolean> {
    const filter: any = { username: username.toLowerCase() }
    if (excludeUserId) {
      filter._id = { $ne: excludeUserId }
    }
    const existingUser = await this.userRepository.findOne(filter)
    return !existingUser
  }

  async getUsers(excludeUserId?: string, limit: number = 50): Promise<UserResponseDto[]> {
    const filter = excludeUserId ? { _id: { $ne: excludeUserId } } : {}
    const users = await this.userRepository.find(filter, limit)
    return users.map(u => new UserResponseDto(u))
  }
}
