const Notification = require("../models/Notification");
const UserNotification = require("../models/UserNotification");
const NotificationPreference = require("../models/NotificationPreference");
const NotificationService = require("../services/notificationService");
const emailService = require("../services/emailService");
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require("../utils/response");
const { getPagination, getPaginationMeta } = require("../utils/pagination");

// Get user's notifications
exports.getUserNotifications = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req);
    const { unread_only } = req.query;
    const userId = req.user.id;

    const notifications = await UserNotification.findByUserId(
      userId,
      limit,
      offset,
      unread_only === "true",
    );

    // Transform notifications for frontend
    const transformedNotifications = notifications.map((notification) => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      type: notification.type_name,
      status: notification.status,
      metadata: JSON.parse(notification.metadata || "{}"),
      createdAt: notification.notification_created_at,
      readAt: notification.read_at,
    }));

    const total = await UserNotification.getUnreadCount(userId);
    const pagination = getPaginationMeta(page, limit, total);

    paginatedResponse(
      res,
      transformedNotifications,
      pagination,
      "Notifications retrieved successfully",
    );
  } catch (error) {
    next(error);
  }
};

// Mark notification as read
exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await UserNotification.markAsRead(id, userId);
    successResponse(res, null, "Notification marked as read");
  } catch (error) {
    next(error);
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await UserNotification.markAllAsRead(userId);
    successResponse(res, null, "All notifications marked as read");
  } catch (error) {
    next(error);
  }
};

// Get unread notification count
exports.getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const count = await UserNotification.getUnreadCount(userId);

    successResponse(res, { count }, "Unread count retrieved successfully");
  } catch (error) {
    next(error);
  }
};

// Get user's notification preferences
exports.getPreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Initialize defaults if not exists
    await NotificationPreference.initializeDefaultsForUser(userId);

    const preferences = await NotificationPreference.findByUserId(userId);

    const transformedPreferences = preferences.map((pref) => ({
      id: pref.id,
      type: pref.type_name,
      description: pref.type_description,
      channels: JSON.parse(pref.channels),
      defaultChannels: JSON.parse(pref.default_channels),
      enabled: Boolean(pref.enabled),
    }));

    successResponse(
      res,
      transformedPreferences,
      "Preferences retrieved successfully",
    );
  } catch (error) {
    next(error);
  }
};

// Update notification preferences
exports.updatePreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { preferences } = req.body;

    for (const pref of preferences) {
      await NotificationPreference.create({
        user_id: userId,
        notification_type_id: pref.typeId,
        channels: pref.channels,
        enabled: pref.enabled,
      });
    }

    successResponse(res, null, "Preferences updated successfully");
  } catch (error) {
    next(error);
  }
};

// Create notification (Admin/System use)
exports.createNotification = async (req, res, next) => {
  try {
    const {
      type,
      title,
      message,
      priority,
      targetRoles,
      targetUsers,
      metadata,
      scheduledAt,
      expiresAt,
    } = req.body;

    const notificationId = await NotificationService.createNotification({
      type,
      title,
      message,
      priority,
      targetRoles,
      targetUsers,
      metadata,
      scheduledAt,
      expiresAt,
      createdBy: req.user.id,
    });

    successResponse(
      res,
      { id: notificationId },
      "Notification created successfully",
      201,
    );
  } catch (error) {
    next(error);
  }
};

// Get all notifications (Admin only)
exports.getAllNotifications = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req);
    const { type_id, priority } = req.query;

    const filters = {};
    if (type_id) filters.type_id = type_id;
    if (priority) filters.priority = priority;

    const notifications = await Notification.findAll(limit, offset, filters);
    const total = await Notification.count(filters);
    const pagination = getPaginationMeta(page, limit, total);

    const transformedNotifications = notifications.map((notification) => ({
      id: notification.id,
      type: notification.type_name,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      targetRoles: JSON.parse(notification.target_roles || "[]"),
      targetUsers: JSON.parse(notification.target_users || "[]"),
      metadata: JSON.parse(notification.metadata || "{}"),
      createdAt: notification.created_at,
      scheduledAt: notification.scheduled_at,
      expiresAt: notification.expires_at,
    }));

    paginatedResponse(
      res,
      transformedNotifications,
      pagination,
      "Notifications retrieved successfully",
    );
  } catch (error) {
    next(error);
  }
};

// Delete notification (Admin only)
exports.deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    await Notification.delete(id);
    successResponse(res, null, "Notification deleted successfully");
  } catch (error) {
    next(error);
  }
};

// Trigger periodic checks manually (Admin only)
exports.triggerPeriodicChecks = async (req, res, next) => {
  try {
    await NotificationService.runPeriodicChecks();
    successResponse(res, null, "Periodic checks triggered successfully");
  } catch (error) {
    next(error);
  }
};

// Test email configuration (Admin only)
exports.testEmailConfig = async (req, res, next) => {
  try {
    const { email } = req.body;
    const testEmail = email || req.user.email;

    if (!testEmail) {
      return errorResponse(res, "Email address is required", 400);
    }

    // Verify email service connection
    const isConnected = await emailService.verifyConnection();
    if (!isConnected) {
      return errorResponse(
        res,
        "Email service is not properly configured",
        500,
      );
    }

    // Send test email
    const result = await emailService.sendTestEmail(testEmail);

    if (result.success) {
      successResponse(
        res,
        { messageId: result.messageId },
        "Test email sent successfully",
      );
    } else {
      errorResponse(res, `Failed to send test email: ${result.error}`, 500);
    }
  } catch (error) {
    next(error);
  }
};

// Get email service status (Admin only)
exports.getEmailStatus = async (req, res, next) => {
  try {
    const isConfigured = emailService.isConfigured;
    const isConnected = isConfigured
      ? await emailService.verifyConnection()
      : false;

    successResponse(
      res,
      {
        configured: isConfigured,
        connected: isConnected,
        host: process.env.EMAIL_HOST || "Not configured",
        port: process.env.EMAIL_PORT || "Not configured",
        user: process.env.EMAIL_USER || "Not configured",
      },
      "Email service status retrieved",
    );
  } catch (error) {
    next(error);
  }
};
