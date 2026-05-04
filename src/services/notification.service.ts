import { apiFetch } from "./api"

export interface INotification {
  _id: string;
  recipient: string;
  sender: {
    _id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  type: 'REACTION' | 'COMMENT' | 'FRIEND_REQUEST' | 'FRIEND_ACCEPT';
  referenceId?: string;
  referenceType?: 'POST' | 'COMMENT' | 'USER';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getNotifications = async (): Promise<INotification[]> => {
  return apiFetch("/notifications")
}

export const getUnreadCount = async (): Promise<{ unreadCount: number }> => {
  return apiFetch("/notifications/unread-count")
}

export const markAsRead = async (id: string): Promise<INotification> => {
  return apiFetch(`/notifications/${id}/read`, {
    method: "PUT",
  })
}

export const markAllAsRead = async (): Promise<{ message: string }> => {
  return apiFetch("/notifications/read-all", {
    method: "PUT",
  })
}
