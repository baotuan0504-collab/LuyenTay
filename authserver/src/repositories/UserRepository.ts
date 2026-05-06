import { User, UserEntity } from "../entities/User"

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>
  findByEmail(email: string): Promise<UserEntity | null>
  findByUsername(username: string): Promise<UserEntity | null>
  findOne(filter: Record<string, unknown>): Promise<UserEntity | null>
  findManyExcept(userId: string, limit: number): Promise<UserEntity[]>
  search(
    query: string,
    excludeUserId: string,
    limit: number,
  ): Promise<UserEntity[]>
  create(userData: Partial<UserEntity>): Promise<UserEntity>
  updateById(
    id: string,
    update: Record<string, unknown>,
  ): Promise<UserEntity | null>
  save(user: UserEntity): Promise<UserEntity>
}

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<UserEntity | null> {
    try {
      return await User.findById(id)
    } catch (error) {
      throw new Error("Database error occurred while finding user")
    }
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    try {
      return await User.findOne({ email: email.toLowerCase() })
    } catch (error) {
      throw new Error("Database error occurred while finding email")
    }
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    try {
      return await User.findOne({ username: username.toLowerCase() })
    } catch (error) {
      throw new Error("Database error occurred while finding username")
    }
  }

  async findOne(filter: Record<string, unknown>): Promise<UserEntity | null> {
    try {
      return await User.findOne(filter)
    } catch (error) {
      throw new Error("Database error occurred during query")
    }
  }

  async findManyExcept(userId: string, limit: number): Promise<UserEntity[]> {
    try {
      return (await User.find({ _id: { $ne: userId } })
        .limit(limit)
        .select("-password")) as UserEntity[]
    } catch (error) {
      throw new Error("Database error occurred during bulk query")
    }
  }

  async search(
    query: string,
    excludeUserId: string,
    limit: number,
  ): Promise<UserEntity[]> {
    try {
      const searchRegex = query
        ? { $regex: query, $options: "i" }
        : { $exists: true }
      return (await User.find({
        _id: { $ne: excludeUserId },
        $or: [{ name: searchRegex }, { username: searchRegex }],
      })
        .limit(limit)
        .select("-password")) as UserEntity[]
    } catch (error) {
      throw new Error("Database error occurred during search")
    }
  }

  async create(userData: Partial<UserEntity>): Promise<UserEntity> {
    try {
      return await User.create(userData)
    } catch (error) {
      throw new Error("Database error occurred during user creation")
    }
  }

  async updateById(
    id: string,
    update: Record<string, unknown>,
  ): Promise<UserEntity | null> {
    try {
      return await User.findByIdAndUpdate(id, update, {
        new: true,
      })
    } catch (error) {
      throw new Error("Database error occurred during update")
    }
  }

  async save(user: UserEntity): Promise<UserEntity> {
    try {
      const updatedUser = await User.findByIdAndUpdate(user._id, user, {
        new: true,
      })
      if (!updatedUser) throw new Error("User not found to save")
      return updatedUser as UserEntity
    } catch (error) {
      throw new Error("Database error occurred during save")
    }
  }
}
