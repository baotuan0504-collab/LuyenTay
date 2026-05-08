import mongoose from "mongoose"
import { IPost, Post } from "../modules/post/post.entity"
import { Reaction } from "../modules/reaction/reaction.entity"

export interface IPostRepository {
  create(data: Partial<IPost>): Promise<IPost>
  findById(id: string): Promise<IPost | null>
  findWithFilter(filter: any): Promise<IPost[]>
  update(id: string, data: Partial<IPost>): Promise<IPost | null>
  delete(id: string): Promise<boolean>
  getReactionsForPosts(postIds: string[]): Promise<any[]>
}

export class PostRepository implements IPostRepository {
  async create(data: Partial<IPost>): Promise<IPost> {
    const post = new Post(data)
    return await post.save()
  }

  async findById(id: string): Promise<IPost | null> {
    return await Post.findById(id).populate("user", "name username avatar")
  }

  async findWithFilter(filter: any): Promise<IPost[]> {
    return await Post.find(filter)
      .populate("user", "name username avatar coverPhoto")
      .sort({ createdAt: -1 })
  }

  async update(id: string, data: Partial<IPost>): Promise<IPost | null> {
    return await Post.findByIdAndUpdate(id, data, { new: true }).populate(
      "user",
      "name username avatar",
    )
  }

  async delete(id: string): Promise<boolean> {
    const result = await Post.findByIdAndDelete(id)
    return !!result
  }

  async getReactionsForPosts(postIds: string[]): Promise<any[]> {
    return await Reaction.find({
      targetId: { $in: postIds.map(id => new mongoose.Types.ObjectId(id)) },
      targetType: "post",
    })
  }
}
