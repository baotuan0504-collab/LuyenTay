import { Friend } from "../model/friend.model";
import { User } from "../../user/model/user.model";
import mongoose from "mongoose";

export class FriendService {
  static async sendRequest(requesterId: string, recipientId: string) {
    try {
      if (requesterId === recipientId) {
        throw new Error("You cannot send a friend request to yourself");
      }

      // Check if user exists
      const recipient = await User.findById(recipientId);
      if (!recipient) throw new Error("Recipient user not found");

      // Check for existing friendship or request
      const existing = await Friend.findOne({
        $or: [
          { requester: requesterId, recipient: recipientId },
          { requester: recipientId, recipient: requesterId },
        ],
      });

      if (existing) {
        if (existing.status === "accepted") throw new Error("Already friends");
        if (existing.status === "pending") {
           if (existing.requester.toString() === requesterId) {
             throw new Error("Friend request already sent");
           } else {
             throw new Error("You have a pending request from this user");
           }
        }
        // If declined, we can "reset" it to pending
        if (existing.status === "declined") {
          existing.requester = new mongoose.Types.ObjectId(requesterId);
          existing.recipient = new mongoose.Types.ObjectId(recipientId);
          existing.status = "pending";
          return await existing.save();
        }
      }

      const newRequest = new Friend({
        requester: requesterId,
        recipient: recipientId,
        status: "pending",
      });

      return await newRequest.save();
    } catch (error: any) {
      console.error("Error in sendRequest:", error.message);
      throw error;
    }
  }

  static async acceptRequest(recipientId: string, requesterId: string) {
    try {
      const request = await Friend.findOne({
        requester: requesterId,
        recipient: recipientId,
        status: "pending",
      });

      if (!request) throw new Error("Friend request not found");

      request.status = "accepted";
      return await request.save();
    } catch (error: any) {
      console.error("Error in acceptRequest:", error.message);
      throw error;
    }
  }

  static async declineRequest(recipientId: string, requesterId: string) {
    try {
      const request = await Friend.findOne({
        requester: requesterId,
        recipient: recipientId,
        status: "pending",
      });

      if (!request) throw new Error("Friend request not found");

      request.status = "declined";
      return await request.save();
    } catch (error: any) {
      console.error("Error in declineRequest:", error.message);
      throw error;
    }
  }

  static async unfriend(userId1: string, userId2: string) {
    try {
      console.log(`[FriendService] Attempting unfriend/cancel: ${userId1} and ${userId2}`);
      
      // Deletes any relationship between two users (accepted or pending)
      const result = await Friend.findOneAndDelete({
        $or: [
          { requester: new mongoose.Types.ObjectId(userId1), recipient: new mongoose.Types.ObjectId(userId2) },
          { requester: new mongoose.Types.ObjectId(userId2), recipient: new mongoose.Types.ObjectId(userId1) },
        ],
      });

      if (!result) {
        console.log(`[FriendService] No friendship record found to delete for ${userId1} and ${userId2}`);
        return { success: true, message: "No record found" };
      }
      
      console.log(`[FriendService] Deleted friendship record: ${result._id}`);
      return { success: true };
    } catch (error: any) {
      console.error("Error in unfriend:", error.message);
      throw error;
    }
  }

  static async getFriends(userId: string) {
    try {
      const friendships = await Friend.find({
        $or: [
          { requester: userId, status: "accepted" },
          { recipient: userId, status: "accepted" },
        ],
      }).populate("requester recipient", "name username avatar email");

      const friends = friendships.map((f: any) => {
        const isRequester = f.requester?._id?.toString() === userId;
        return isRequester ? f.recipient : f.requester;
      });

      return friends.filter(friend => friend !== null);
    } catch (error: any) {
      console.error("Error in getFriends:", error.message);
      throw error;
    }
  }

  static async getPendingRequests(userId: string) {
    try {
      // Requests received by the user
      const received = await Friend.find({
        recipient: userId,
        status: "pending",
      }).populate("requester", "name username avatar email");

      // Requests sent by the user
      const sent = await Friend.find({
        requester: userId,
        status: "pending",
      }).populate("recipient", "name username avatar email");

      return {
        received: received
          .filter((r: any) => r.requester)
          .map((r: any) => ({
            _id: r._id,
            user: r.requester,
            createdAt: r.createdAt
          })),
        sent: sent
          .filter((s: any) => s.recipient)
          .map((s: any) => ({
            _id: s._id,
            user: s.recipient,
            createdAt: s.createdAt
          })),
      };
    } catch (error: any) {
      console.error("Error in getPendingRequests:", error.message);
      throw error;
    }
  }

  static async getFriendshipStatus(userId1: string, userId2: string) {
    try {
      const friendship = await Friend.findOne({
        $or: [
          { requester: userId1, recipient: userId2 },
          { requester: userId2, recipient: userId1 },
        ],
      });

      if (!friendship) return { status: "none" };

      return {
        status: friendship.status,
        requester: friendship.requester,
        recipient: friendship.recipient,
      };
    } catch (error: any) {
      console.error("Error in getFriendshipStatus:", error.message);
      throw error;
    }
  }
}
