export interface UpsertReactionDto {
  user: string
  targetId: string
  targetType: "post" | "comment" | "story"
  reactionType: "like" | "love" | "haha" | "wow" | "sad" | "angry"
}

export interface ReactionResponseDto {
  _id: string
  user: string
  targetId: string
  targetType: "post" | "comment" | "story"
  reactionType: "like" | "love" | "haha" | "wow" | "sad" | "angry"
  createdAt: string
  updatedAt: string
}
