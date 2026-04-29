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
  participants?: ChatParticipant[]
  type: 'PRIVATE' | 'GROUP'
  name?: string
  avatar?: string
  lastMessage?: {
    text: string
    sender: string
    createdAt: string
  }
  lastMessageAt?: string
  unreadCount: number
  creator?: string
  nicknames?: Record<string, string>
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

export const createGroupChat = async (participants: string[], name: string): Promise<ChatResponse> => {
  return apiFetch("/chats/group", {
    method: "POST",
    body: JSON.stringify({ participants, name }),
  })
}

export const deleteChat = async (chatId: string): Promise<void> => {
  return apiFetch(`/chats/${chatId}`, {
    method: "DELETE",
  })
}

export const updateChat = async (
  chatId: string, 
  data: { name?: string, avatar?: string, nicknames?: Record<string, string> }
): Promise<ChatResponse> => {
  return apiFetch(`/chats/${chatId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export const addParticipants = async (chatId: string, participants: string[]): Promise<ChatResponse> => {
  return apiFetch(`/chats/${chatId}/participants`, {
    method: "POST",
    body: JSON.stringify({ participants }),
  })
}
