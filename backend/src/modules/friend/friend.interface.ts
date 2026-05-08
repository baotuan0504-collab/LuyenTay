import { 
  FriendResponseDto, 
  FriendshipStatusResponseDto, 
  PendingRequestsResponseDto 
} from "./friend.dto"

export interface IFriendService {
  sendRequest(requesterId: string, recipientId: string): Promise<any>
  acceptRequest(recipientId: string, requesterId: string): Promise<any>
  declineRequest(recipientId: string, requesterId: string): Promise<any>
  unfriend(userId1: string, userId2: string): Promise<{ success: boolean }>
  getFriends(userId: string): Promise<FriendResponseDto[]>
  getPendingRequests(userId: string): Promise<PendingRequestsResponseDto>
  getFriendshipStatus(userId1: string, userId2: string): Promise<FriendshipStatusResponseDto>
}
