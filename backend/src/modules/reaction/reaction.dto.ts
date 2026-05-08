export class UpsertReactionDto {
  targetId: string
  targetType: string
  reactionType: string

  constructor(data: any) {
    this.targetId = data.targetId
    this.targetType = data.targetType
    this.reactionType = data.reactionType
  }
}

export class ReactionResponseDto {
  id: string
  _id: string
  user: any
  targetId: string
  targetType: string
  reactionType: string
  createdAt: string

  constructor(reaction: any) {
    this.id = reaction._id.toString()
    this._id = reaction._id.toString()
    this.user = reaction.user?._id ? {
      id: reaction.user._id.toString(),
      _id: reaction.user._id.toString(),
      name: reaction.user.name,
      username: reaction.user.username,
      avatar: reaction.user.avatar
    } : reaction.user.toString()
    this.targetId = reaction.targetId.toString()
    this.targetType = reaction.targetType
    this.reactionType = reaction.reactionType
    this.createdAt = reaction.createdAt?.toISOString()
  }
}
