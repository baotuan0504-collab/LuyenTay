import { UpdateUserDto, UserResponseDto } from "./user.dto"

export interface IUserService {
  getUserById(id: string): Promise<UserResponseDto>
  updateProfile(id: string, dto: UpdateUserDto): Promise<UserResponseDto>
  searchUsers(query: string): Promise<UserResponseDto[]>
  checkUsername(username: string, excludeUserId?: string): Promise<boolean>
  getUsers(excludeUserId?: string, limit?: number): Promise<UserResponseDto[]>
}
