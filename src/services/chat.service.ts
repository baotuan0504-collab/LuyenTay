import { apiFetch } from "./api"

export interface ChatParticipant {
  _id: string
  name: string
  username: string
  avatar: string
  publicKey?: string
}

export interface ChatResponse {
  _id: string
  participant: ChatParticipant | null
  lastMessage?: {
    text: string
    sender: string
    createdAt: string
  }
  lastMessageAt?: string
  unreadCount: number
  createdAt: string
}

export const getChats = async (): Promise<ChatResponse[]> => {
  return apiFetch("/chats")
}

export const getOrCreateChat = async (
  participantId: string,
): Promise<ChatResponse> => {
  return apiFetch(`/chats/with/${participantId}`, {
    method: "POST",
  })
}

export const getChatById = async (chatId: string): Promise<ChatResponse> => {
  return apiFetch(`/chats/${chatId}`)
}
