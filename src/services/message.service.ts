import { apiFetch } from "./api"

import type { ChatParticipant } from "./chat.service"

export interface MessageResponse {
  _id: string
  chatId: string
  sender: ChatParticipant
  text: string
  createdAt: string
}

export const getMessages = async (
  chatId: string,
  limit: number = 20,
  before?: string,
): Promise<MessageResponse[]> => {
  let url = `/messages/chat/${chatId}?limit=${limit}`
  if (before) {
    url += `&before=${encodeURIComponent(before)}`
  }
  return apiFetch(url)
}
