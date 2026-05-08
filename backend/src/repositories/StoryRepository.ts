import { IStory, Story } from "../modules/story/story.entity"

export interface IStoryRepository {
  create(data: Partial<IStory>): Promise<IStory>
  findById(id: string): Promise<IStory | null>
  findWithFilter(filter: any): Promise<IStory[]>
}

export class StoryRepository implements IStoryRepository {
  async create(data: Partial<IStory>): Promise<IStory> {
    const story = new Story(data)
    return await story.save()
  }

  async findById(id: string): Promise<IStory | null> {
    return await Story.findById(id).populate("user", "name username avatar")
  }

  async findWithFilter(filter: any): Promise<IStory[]> {
    return await Story.find(filter)
      .populate("user", "name username avatar coverPhoto")
      .sort({ createdAt: -1 })
  }
}
