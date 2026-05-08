import mongoose from "mongoose"
import { User } from "../user/user.entity"
import { FriendRepository, IFriendRepository } from "../../repositories/FriendRepository"
import { IUserRepository, UserRepository } from "../../repositories/UserRepository"
import { 
  FriendResponseDto, 
  FriendshipStatusResponseDto, 
  PendingRequestsResponseDto 
} from "./friend.dto"
import { IFriendService } from "./friend.interface"

export class FriendService implements IFriendService {
  private friendRepository: IFriendRepository
  private userRepository: IUserRepository

  constructor(
    friendRepository: IFriendRepository = new FriendRepository(),
    userRepository: IUserRepository = new UserRepository()
  ) {
    this.friendRepository = friendRepository
    this.userRepository = userRepository
  }

  async sendRequest(requesterId: string, recipientId: string): Promise<any> {
    if (requesterId === recipientId) {
      throw new Error("You cannot send a friend request to yourself")
    }

    const recipient = await this.userRepository.findById(recipientId)
    if (!recipient) throw new Error("Recipient user not found")

    const existing = await this.friendRepository.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId },
      ],
    })

    if (existing) {
      if (existing.status === "accepted") throw new Error("Already friends")
      if (existing.status === "pending") {
        if (existing.requester.toString() === requesterId) {
          throw new Error("Friend request already sent")
        } else {
          throw new Error("You have a pending request from this user")
        }
      }
      if (existing.status === "declined") {
        return await this.friendRepository.update(existing._id.toString(), {
          requester: requesterId,
          recipient: recipientId,
          status: "pending",
        })
      }
    }

    return await this.friendRepository.create({
      requester: requesterId,
      recipient: recipientId,
      status: "pending",
    })
  }

  async acceptRequest(recipientId: string, requesterId: string): Promise<any> {
    const request = await this.friendRepository.findOne({
      requester: requesterId,
      recipient: recipientId,
      status: "pending",
    })

    if (!request) throw new Error("Friend request not found")

    return await this.friendRepository.update(request._id.toString(), { status: "accepted" })
  }

  async declineRequest(recipientId: string, requesterId: string): Promise<any> {
    const request = await this.friendRepository.findOne({
      requester: requesterId,
      recipient: recipientId,
      status: "pending",
    })

    if (!request) throw new Error("Friend request not found")

    return await this.friendRepository.update(request._id.toString(), { status: "declined" })
  }

  async unfriend(userId1: string, userId2: string): Promise<{ success: boolean }> {
    const result = await this.friendRepository.delete({
      $or: [
        { requester: userId1, recipient: userId2 },
        { requester: userId2, recipient: userId1 },
      ],
    })

    return { success: result.deletedCount > 0 }
  }

  async getFriends(userId: string): Promise<FriendResponseDto[]> {
    const friendships = await this.friendRepository.find({
      $or: [
        { requester: userId, status: "accepted" },
        { recipient: userId, status: "accepted" },
      ],
    })

    const friends = friendships.map((f: any) => {
      const requesterId = f.requester?._id?.toString() || f.requester?.toString()
      const isRequester = requesterId === userId.toString()
      return isRequester ? f.recipient : f.requester
    })

    return friends
      .filter(friend => friend && (friend._id?.toString() || friend.toString()) !== userId.toString())
      .map(u => new FriendResponseDto(u))
  }

  async getPendingRequests(userId: string): Promise<PendingRequestsResponseDto> {
    const received = await this.friendRepository.find({
      recipient: userId,
      status: "pending",
    })

    const sent = await this.friendRepository.find({
      requester: userId,
      status: "pending",
    })

    return new PendingRequestsResponseDto({ received, sent })
  }

  async getFriendshipStatus(userId1: string, userId2: string): Promise<FriendshipStatusResponseDto> {
    const friendship = await this.friendRepository.findOne({
      $or: [
        { requester: userId1, recipient: userId2 },
        { requester: userId2, recipient: userId1 },
      ],
    })

    if (!friendship) return new FriendshipStatusResponseDto({ status: "none" })

    return new FriendshipStatusResponseDto(friendship)
  }
}
