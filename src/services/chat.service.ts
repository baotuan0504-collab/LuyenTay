import { apiFetch } from "./api"

export interface ChatParticipant {
  _id: string
  name: string
  username: string
  avatar: string
}

export interface ChatResponse {
  _id: string
  participant: ChatParticipant | null
  lastMessage?: any
  lastMessageAt: string
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
