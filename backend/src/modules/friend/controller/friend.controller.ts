import { Request, Response, NextFunction } from "express";
import { FriendService } from "../service/friend.service";
import { AuthRequest } from "../../../middleware/auth";
import { Notification } from "../../notification/model/notification.model";
import { getIO } from "../../../utils/socket";
import { 
  SendFriendRequestDto, 
  FriendResponseDto, 
  PendingRequestsResponseDto, 
  FriendshipStatusResponseDto 
} from "../dto/friend.dto";

export class FriendController {
  static async sendRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const requesterId = (req as AuthRequest).userId;
      const { recipientId } = req.body as SendFriendRequestDto;

      if (!recipientId) return res.status(400).json({ message: "Recipient ID is required" });
      if (!requesterId) return res.status(401).json({ message: "Unauthorized" });

      const request = await FriendService.sendRequest(requesterId, recipientId);

      // Emit Notification
      if (recipientId && recipientId !== requesterId) {
        const notification = new Notification({
          recipient: recipientId,
          sender: requesterId,
          type: "FRIEND_REQUEST",
          referenceId: requesterId,
          referenceType: "USER",
        });
        await notification.save();
        await notification.populate("sender", "name username avatar");

        try {
          const io = getIO();
          io.to(`user:${recipientId}`).emit("new-notification", notification);
        } catch (e) {
          console.error("Socket emit failed", e);
        }
      }

      res.status(201).json(request);
    } catch (error) {
      next(error);
    }
  }

  static async acceptRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const recipientId = (req as AuthRequest).userId;
      const requesterId = req.params.requesterId as string;

      if (!requesterId) return res.status(400).json({ message: "Requester ID is required" });
      if (!recipientId || typeof recipientId !== "string") {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const friendship = await FriendService.acceptRequest(recipientId, requesterId);

      // Emit Notification
      if (requesterId && requesterId !== recipientId) {
        const notification = new Notification({
          recipient: requesterId,
          sender: recipientId,
          type: "FRIEND_ACCEPT",
          referenceId: recipientId,
          referenceType: "USER",
        });
        await notification.save();
        await notification.populate("sender", "name username avatar");

        try {
          const io = getIO();
          io.to(`user:${requesterId}`).emit("new-notification", notification);
        } catch (e) {
          console.error("Socket emit failed", e);
        }
      }

      res.json(friendship);
    } catch (error) {
      next(error);
    }
  }

  static async declineRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const recipientId = (req as AuthRequest).userId;
      const requesterId = req.params.requesterId as string;

      if (!requesterId) return res.status(400).json({ message: "Requester ID is required" });
      if (!recipientId || typeof recipientId !== "string") {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await FriendService.declineRequest(recipientId, requesterId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async unfriend(req: Request, res: Response, next: NextFunction) {
    try {
      const userId1 = (req as AuthRequest).userId;
      const userId2 = req.params.userId2 as string;

      if (!userId2) return res.status(400).json({ message: "User ID is required" });
      if (!userId1 || typeof userId1 !== "string") {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await FriendService.unfriend(userId1, userId2);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getFriends(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).userId;
      if (!userId || typeof userId !== "string") {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const friends = await FriendService.getFriends(userId);
      res.json(friends as FriendResponseDto[]);
    } catch (error) {
      next(error);
    }
  }

  static async getPendingRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).userId;
      if (!userId || typeof userId !== "string") {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const requests = await FriendService.getPendingRequests(userId);
      res.json(requests as PendingRequestsResponseDto);
    } catch (error) {
      next(error);
    }
  }

  static async getFriendshipStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId1 = (req as AuthRequest).userId;
      const userId2 = req.params.userId2 as string;

      if (!userId2) return res.status(400).json({ message: "User ID is required" });
      if (!userId1 || typeof userId1 !== "string") {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const status = await FriendService.getFriendshipStatus(userId1, userId2);
      res.json(status as FriendshipStatusResponseDto);
    } catch (error) {
      next(error);
    }
  }
}
