export interface CreateChatDto {
  participants: string[]
}

export interface ChatResponseDto {
  _id: string
  participants: string[]
  lastMessage?: string
  lastMessageAt?: string
  createdAt: string
  updatedAt: string
}
