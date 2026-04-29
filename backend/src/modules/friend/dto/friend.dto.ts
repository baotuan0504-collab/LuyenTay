export interface SendFriendRequestDto {
  recipientId: string;
}

export interface FriendResponseDto {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
  email?: string;
}

export interface FriendRequestResponseDto {
  _id: string;
  user: FriendResponseDto;
  createdAt: Date;
}

export interface PendingRequestsResponseDto {
  received: FriendRequestResponseDto[];
  sent: FriendRequestResponseDto[];
}

export interface FriendshipStatusResponseDto {
  status: "pending" | "accepted" | "declined" | "blocked" | "none";
  requester?: string;
  recipient?: string;
}
