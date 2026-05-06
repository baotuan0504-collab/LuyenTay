import { UpdateProfileDto, UserResponseDto } from "./user.dto"

export interface IUserService {
  getAllExcept(userId: string): Promise<UserResponseDto[]>
  findById(userId: string): Promise<UserResponseDto>
  updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserResponseDto>
  checkUsernameAvailability(
    username: string,
    excludeUserId?: string,
  ): Promise<boolean>
  searchUsers(query: string, excludeUserId: string): Promise<UserResponseDto[]>
}
