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
): Promise<MessageResponse[]> => {
  return apiFetch(`/messages/chat/${chatId}`)
}
