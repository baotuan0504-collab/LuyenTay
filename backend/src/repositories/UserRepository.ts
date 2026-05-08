import { User } from "../modules/user/user.entity"

export interface IUserRepository {
  findById(id: string): Promise<any>
  findOne(filter: any): Promise<any>
  update(id: string, data: any): Promise<any>
  search(query: string, limit?: number): Promise<any[]>
  find(filter: any, limit?: number): Promise<any[]>
}

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<any> {
    return await User.findById(id).select("-password")
  }

  async findOne(filter: any): Promise<any> {
    return await User.findOne(filter).select("-password")
  }

  async update(id: string, data: any): Promise<any> {
    return await User.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).select("-password")
  }

  async search(query: string, limit: number = 20): Promise<any[]> {
    return await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { username: { $regex: query, $options: "i" } }
      ]
    })
    .select("name username avatar coverPhoto email publicKey")
    .limit(limit)
  }

  async find(filter: any, limit: number = 50): Promise<any[]> {
    return await User.find(filter)
      .select("name email avatar username publicKey school birthday relationship interests hometown coverPhoto")
      .limit(limit)
  }
}
