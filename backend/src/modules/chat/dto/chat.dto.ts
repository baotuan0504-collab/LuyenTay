export interface CreateChatDto {
  participants: string[]
}

export interface ChatResponseDto {
  _id: string
  participants: any[]
  participant: any
  lastMessage?: any
  lastMessageAt?: string
  createdAt: string
  updatedAt: string
}
