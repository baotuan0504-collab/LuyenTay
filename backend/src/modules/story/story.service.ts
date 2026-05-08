import { IStoryRepository, StoryRepository } from "../../repositories/StoryRepository"
import { CreateStoryDto, StoryResponseDto } from "./story.dto"
import { IStoryService } from "./story.interface"

export class StoryService implements IStoryService {
  private storyRepository: IStoryRepository

  constructor(storyRepository: IStoryRepository = new StoryRepository()) {
    this.storyRepository = storyRepository
  }

  async createStory(userId: string, dto: CreateStoryDto): Promise<StoryResponseDto> {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const story = await this.storyRepository.create({
      user: userId as any,
      imageUrl: dto.imageUrl,
      videoUrl: dto.videoUrl,
      description: dto.description,
      expiresAt,
      isActive: true,
    })

    const populatedStory = await this.storyRepository.findById(story._id.toString())
    return new StoryResponseDto(populatedStory)
  }

  async getStories(targetUserId?: string): Promise<StoryResponseDto[]> {
    const filter: any = {
      isActive: true,
      expiresAt: { $gt: new Date() },
    }

    if (targetUserId) {
      filter.user = targetUserId
    }

    const stories = await this.storyRepository.findWithFilter(filter)
    return stories.map(story => new StoryResponseDto(story))
  }

  async getArchivedStories(userId: string): Promise<StoryResponseDto[]> {
    const stories = await this.storyRepository.findWithFilter({
      user: userId,
      $or: [
        { expiresAt: { $lte: new Date() } },
        { isActive: false }
      ]
    })
    return stories.map(story => new StoryResponseDto(story))
  }
}
