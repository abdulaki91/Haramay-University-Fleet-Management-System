import api from "../axiosInstance";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    current_page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  priority: "low" | "medium" | "high" | "critical";
  type: string;
  status: "pending" | "sent" | "delivered" | "read";
  metadata: Record<string, any>;
  createdAt: string;
  readAt?: string;
}

export interface NotificationPreference {
  id: string;
  type: string;
  description: string;
  channels: string[];
  defaultChannels: string[];
  enabled: boolean;
}

export const notificationService = {
  // Get user notifications
  getAll: async (unreadOnly = false): Promise<Notification[]> => {
    const response = await api.get<PaginatedResponse<Notification>>(
      `/notifications?unread_only=${unreadOnly}`,
    );
    return response.data.data;
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<ApiResponse<{ count: number }>>(
      "/notifications/unread-count",
    );
    return response.data.data.count;
  },

  // Mark notification as read
  markAsRead: async (id: string): Promise<void> => {
    await api.put(`/notifications/${id}/read`);
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    await api.put("/notifications/mark-all-read");
  },

  // Get notification preferences
  getPreferences: async (): Promise<NotificationPreference[]> => {
    const response = await api.get<ApiResponse<NotificationPreference[]>>(
      "/notifications/preferences",
    );
    return response.data.data;
  },

  // Update notification preferences
  updatePreferences: async (
    preferences: Array<{
      typeId: number;
      channels: string[];
      enabled: boolean;
    }>,
  ): Promise<void> => {
    await api.put("/notifications/preferences", { preferences });
  },

  // Admin: Create notification
  createNotification: async (data: {
    type: string;
    title: string;
    message: string;
    priority?: string;
    targetRoles?: string[];
    targetUsers?: number[];
    metadata?: Record<string, any>;
    scheduledAt?: string;
    expiresAt?: string;
  }): Promise<void> => {
    await api.post("/notifications/admin/create", data);
  },

  // Admin: Get all notifications
  getAllAdmin: async (): Promise<Notification[]> => {
    const response = await api.get<PaginatedResponse<Notification>>(
      "/notifications/admin/all",
    );
    return response.data.data;
  },

  // Admin: Delete notification
  deleteNotification: async (id: string): Promise<void> => {
    await api.delete(`/notifications/admin/${id}`);
  },

  // Admin: Trigger periodic checks
  triggerPeriodicChecks: async (): Promise<void> => {
    await api.post("/notifications/admin/trigger-checks");
  },
};
