export interface CreateChatDto {
  participants: string[]
  type?: 'PRIVATE' | 'GROUP'
  name?: string
  avatar?: string
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
