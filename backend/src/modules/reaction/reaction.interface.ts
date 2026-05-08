import { ReactionResponseDto, UpsertReactionDto } from "./reaction.dto"

export interface IReactionService {
  getMyReaction(userId: string, targetId: string, targetType: string): Promise<ReactionResponseDto | null>
  getReactionCounts(targetId: string, targetType: string): Promise<any[]>
  getReactionUsers(targetId: string, targetType: string, reactionType?: string): Promise<ReactionResponseDto[]>
  upsertReaction(userId: string, dto: UpsertReactionDto): Promise<ReactionResponseDto>
  removeReaction(userId: string, targetId: string, targetType: string): Promise<boolean>
}
