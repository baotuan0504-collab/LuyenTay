import { Comment, IComment } from "../modules/comment/comment.entity"

export interface ICommentRepository {
  create(data: any): Promise<IComment>
  findById(id: string): Promise<IComment | null>
  findAll(filter: any): Promise<IComment[]>
  find(filter: any, skip?: number, limit?: number): Promise<IComment[]>
  countDocuments(filter: any): Promise<number>
  findByIdAndUpdate(id: string, data: any, options?: any): Promise<IComment | null>
  deleteMany(filter: any): Promise<any>
  aggregate(pipeline: any[]): Promise<any[]>
}

export class CommentRepository implements ICommentRepository {
  async create(data: any): Promise<IComment> {
    const comment = new Comment(data)
    return await comment.save()
  }

  async findById(id: string): Promise<IComment | null> {
    return await Comment.findById(id).populate("user", "name username avatar")
  }

  async findAll(filter: any): Promise<IComment[]> {
    return await Comment.find(filter)
      .populate("user", "name username avatar")
      .sort({ createdAt: 1 })
  }

  async find(filter: any, skip: number = 0, limit: number = 20): Promise<IComment[]> {
    return await Comment.find(filter)
      .populate("user", "name username avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
  }

  async countDocuments(filter: any): Promise<number> {
    return await Comment.countDocuments(filter)
  }

  async findByIdAndUpdate(id: string, data: any, options: any = { new: true }): Promise<IComment | null> {
    return await Comment.findByIdAndUpdate(id, data, options)
  }

  async deleteMany(filter: any): Promise<any> {
    return await Comment.deleteMany(filter)
  }

  async aggregate(pipeline: any[]): Promise<any[]> {
    return await Comment.aggregate(pipeline)
  }
}
