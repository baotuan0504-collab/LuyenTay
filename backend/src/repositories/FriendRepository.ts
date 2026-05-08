import { Friend, IFriend } from "../modules/friend/friend.entity"

export interface IFriendRepository {
  find(filter: any): Promise<IFriend[]>
  findOne(filter: any): Promise<IFriend | null>
  create(data: any): Promise<IFriend>
  update(id: string, data: any): Promise<IFriend | null>
  delete(filter: any): Promise<any>
}

export class FriendRepository implements IFriendRepository {
  async find(filter: any): Promise<IFriend[]> {
    return await Friend.find(filter)
      .populate("requester", "name username avatar")
      .populate("recipient", "name username avatar")
  }

  async findOne(filter: any): Promise<IFriend | null> {
    return await Friend.findOne(filter)
      .populate("requester", "name username avatar")
      .populate("recipient", "name username avatar")
  }

  async create(data: any): Promise<IFriend> {
    const friend = new Friend(data)
    return await friend.save()
  }

  async update(id: string, data: any): Promise<IFriend | null> {
    return await Friend.findByIdAndUpdate(id, { $set: data }, { new: true })
  }

  async delete(filter: any): Promise<any> {
    return await Friend.deleteOne(filter)
  }
}
