import { NextFunction, Request, Response } from "express"
import { AuthRequest } from "../../middleware/auth"
import { ApiResponse } from "../../utils/ApiResponse"
import { getIO } from "../../utils/socket"
import { Notification } from "../notification/model/notification.model"
import { SendFriendRequestDto } from "./friend.dto"
import { IFriendService } from "./friend.interface"
import { FriendService } from "./friend.service"

export class FriendController {
  private friendService: IFriendService

  constructor(friendService: IFriendService = new FriendService()) {
    this.friendService = friendService
  }

  sendRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requesterId = (req as AuthRequest).userId!
      const { recipientId } = req.body as SendFriendRequestDto

      if (!recipientId) return res.status(400).json(ApiResponse.error("Recipient ID is required"))

      const request = await this.friendService.sendRequest(requesterId, recipientId)

      // Emit Notification
      if (recipientId && recipientId !== requesterId) {
        const notification = new Notification({
          recipient: recipientId,
          sender: requesterId,
          type: "FRIEND_REQUEST",
          referenceId: requesterId,
          referenceType: "USER",
        })
        await notification.save()
        await notification.populate("sender", "name username avatar")

        try {
          const io = getIO()
          io.to(`user:${recipientId}`).emit("new-notification", notification)
        } catch (e) {
          console.error("Socket emit failed", e)
        }
      }

      res.status(201).json(ApiResponse.success(request))
    } catch (error: any) {
      res.status(400).json(ApiResponse.error(error.message))
    }
  }

  acceptRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const recipientId = (req as AuthRequest).userId!
      const requesterId = req.params.requesterId as string

      if (!requesterId) return res.status(400).json(ApiResponse.error("Requester ID is required"))

      const friendship = await this.friendService.acceptRequest(recipientId, requesterId)

      // Emit Notification
      if (requesterId && requesterId !== recipientId) {
        const notification = new Notification({
          recipient: requesterId,
          sender: recipientId,
          type: "FRIEND_ACCEPT",
          referenceId: recipientId,
          referenceType: "USER",
        })
        await notification.save()
        await notification.populate("sender", "name username avatar")

        try {
          const io = getIO()
          io.to(`user:${requesterId}`).emit("new-notification", notification)
        } catch (e) {
          console.error("Socket emit failed", e)
        }
      }

      res.json(ApiResponse.success(friendship))
    } catch (error: any) {
      res.status(400).json(ApiResponse.error(error.message))
    }
  }

  declineRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const recipientId = (req as AuthRequest).userId!
      const requesterId = req.params.requesterId as string

      if (!requesterId) return res.status(400).json(ApiResponse.error("Requester ID is required"))

      const result = await this.friendService.declineRequest(recipientId, requesterId)
      res.json(ApiResponse.success(result))
    } catch (error: any) {
      res.status(400).json(ApiResponse.error(error.message))
    }
  }

  unfriend = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId1 = (req as AuthRequest).userId!
      const userId2 = req.params.userId2 as string

      if (!userId2) return res.status(400).json(ApiResponse.error("User ID is required"))

      const result = await this.friendService.unfriend(userId1, userId2)
      res.json(ApiResponse.success(result))
    } catch (error: any) {
      res.status(400).json(ApiResponse.error(error.message))
    }
  }

  getFriends = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const targetUserId = req.query.userId as string || (req as AuthRequest).userId!
      const friends = await this.friendService.getFriends(targetUserId)
      res.json(ApiResponse.success(friends))
    } catch (error: any) {
      res.status(500).json(ApiResponse.error(error.message))
    }
  }

  getPendingRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthRequest).userId!
      const requests = await this.friendService.getPendingRequests(userId)
      res.json(ApiResponse.success(requests))
    } catch (error: any) {
      res.status(500).json(ApiResponse.error(error.message))
    }
  }

  getFriendshipStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId1 = (req as AuthRequest).userId!
      const userId2 = req.params.userId2 as string

      if (!userId2) return res.status(400).json(ApiResponse.error("User ID is required"))

      const status = await this.friendService.getFriendshipStatus(userId1, userId2)
      res.json(ApiResponse.success(status))
    } catch (error: any) {
      res.status(500).json(ApiResponse.error(error.message))
    }
  }
}
