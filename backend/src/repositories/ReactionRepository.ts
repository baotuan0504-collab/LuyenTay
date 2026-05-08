import { IReaction, Reaction } from "../modules/reaction/reaction.entity"

export interface IReactionRepository {
  findOne(filter: any): Promise<IReaction | null>
  find(filter: any): Promise<IReaction[]>
  findOneAndUpdate(filter: any, data: any, options: any): Promise<IReaction | null>
  findOneAndDelete(filter: any): Promise<IReaction | null>
  aggregate(pipeline: any[]): Promise<any[]>
}

export class ReactionRepository implements IReactionRepository {
  async findOne(filter: any): Promise<IReaction | null> {
    return await Reaction.findOne(filter)
  }

  async find(filter: any): Promise<IReaction[]> {
    return await Reaction.find(filter).populate("user", "name username avatar")
  }

  async findOneAndUpdate(filter: any, data: any, options: any): Promise<IReaction | null> {
    const result = await Reaction.findOneAndUpdate(filter, data, options).exec()
    return result as unknown as IReaction | null
  }

  async findOneAndDelete(filter: any): Promise<IReaction | null> {
    return await Reaction.findOneAndDelete(filter)
  }

  async aggregate(pipeline: any[]): Promise<any[]> {
    return await Reaction.aggregate(pipeline)
  }
}
