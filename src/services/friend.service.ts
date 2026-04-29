import { apiFetch } from "./api";

export interface FriendRequest {
  _id: string;
  user: {
    _id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
}

export const sendFriendRequest = async (recipientId: string) => {
  return apiFetch("/friends/request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ recipientId }),
  });
};

export const acceptFriendRequest = async (requesterId: string) => {
  return apiFetch(`/friends/accept/${requesterId}`, {
    method: "POST",
  });
};

export const declineFriendRequest = async (requesterId: string) => {
  return apiFetch(`/friends/decline/${requesterId}`, {
    method: "POST",
  });
};

export const unfriend = async (userId: string) => {
  return apiFetch(`/friends/unfriend/${userId}`, {
    method: "DELETE",
  });
};

export const getFriendsList = async () => {
  return apiFetch("/friends/list");
};

export const getPendingRequests = async (): Promise<{
  received: FriendRequest[];
  sent: FriendRequest[];
}> => {
  return apiFetch("/friends/requests");
};

export const getFriendshipStatus = async (userId: string): Promise<{
  status: "pending" | "accepted" | "declined" | "blocked" | "none";
  requester?: string;
  recipient?: string;
}> => {
  return apiFetch(`/friends/status/${userId}`);
};
