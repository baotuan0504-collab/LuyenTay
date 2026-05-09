export class SendFriendRequestDto {
  recipientId: string

  constructor(data: any) {
    this.recipientId = data.recipientId
  }
}

export class FriendResponseDto {
  id: string
  _id: string
  name: string
  username: string
  avatar: string
  email: string

  constructor(user: any) {
    this.id = user._id.toString()
    this._id = user._id.toString()
    this.name = user.name
    this.username = user.username
    this.avatar = user.avatar
    this.email = user.email
  }
}

export class PendingRequestDto {
  id: string
  _id: string
  user: FriendResponseDto
  createdAt: string

  constructor(request: any, otherUser: any) {
    this.id = request._id.toString()
    this._id = request._id.toString()
    this.user = new FriendResponseDto(otherUser)
    this.createdAt = request.createdAt?.toISOString()
  }
}

export class PendingRequestsResponseDto {
  received: PendingRequestDto[]
  sent: PendingRequestDto[]

  constructor(data: { received: any[], sent: any[] }) {
    this.received = data.received.map(r => new PendingRequestDto(r, r.requester))
    this.sent = data.sent.map(s => new PendingRequestDto(s, s.recipient))
  }
}

export class FriendshipStatusResponseDto {
  status: "pending" | "accepted" | "declined" | "blocked" | "none"
  requester?: string
  recipient?: string

  constructor(data: any) {
    this.status = data.status
    this.requester = (data.requester?._id || data.requester)?.toString()
    this.recipient = (data.recipient?._id || data.recipient)?.toString()
  }
}
