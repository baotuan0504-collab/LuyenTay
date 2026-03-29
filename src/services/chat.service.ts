import { apiFetch } from "./api";

export interface ChatParticipant {
    _id: string;
    name: string;
    username: string;
    avatar: string;
}

export interface ChatResponse {
    _id: string;
    participant: ChatParticipant | null;
    lastMessage?: any;
    lastMessageAt: string;
    createdAt: string;
}

export const getChats = async (token:string): Promise<ChatResponse[]> => {
    return apiFetch("/chats", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

export const getOrCreateChat = async (
    participantId: string,
    token: string
): Promise<ChatResponse> => {
    return apiFetch(`/chats/with/${participantId}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}