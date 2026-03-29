import { apiFetch } from "./api";

import type { ChatParticipant } from "./chat.service";

export interface MessageResponse {
    _id: string;
    chatId: string;
    sender: ChatParticipant;
    text: string;
    createdAt: string;
}

export const getMessages = async(
    chatId: string,
    token: string
): Promise<MessageResponse[]> => {
    return apiFetch(`/messages/chat/${chatId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}