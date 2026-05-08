import { CreateStoryDto, StoryResponseDto } from "./story.dto"

export interface IStoryService {
  createStory(userId: string, dto: CreateStoryDto): Promise<StoryResponseDto>
  getStories(targetUserId?: string): Promise<StoryResponseDto[]>
  getArchivedStories(userId: string): Promise<StoryResponseDto[]>
}
