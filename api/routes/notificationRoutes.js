const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const notificationController = require("../controllers/notificationController");
const { authenticate, authorize } = require("../middlewares/auth");
const validate = require("../middlewares/validate");

// Get user's notifications
router.get("/", authenticate, notificationController.getUserNotifications);

// Get unread notification count
router.get(
  "/unread-count",
  authenticate,
  notificationController.getUnreadCount,
);

// Mark notification as read
router.put("/:id/read", authenticate, notificationController.markAsRead);

// Mark all notifications as read
router.put(
  "/mark-all-read",
  authenticate,
  notificationController.markAllAsRead,
);

// Get notification preferences
router.get("/preferences", authenticate, notificationController.getPreferences);

// Update notification preferences
router.put(
  "/preferences",
  [
    authenticate,
    body("preferences").isArray().withMessage("Preferences must be an array"),
    body("preferences.*.typeId")
      .isInt()
      .withMessage("Type ID must be an integer"),
    body("preferences.*.channels")
      .isArray()
      .withMessage("Channels must be an array"),
    body("preferences.*.enabled")
      .isBoolean()
      .withMessage("Enabled must be boolean"),
    validate,
  ],
  notificationController.updatePreferences,
);

// Admin routes
router.get(
  "/admin/all",
  [authenticate, authorize("system_admin")],
  notificationController.getAllNotifications,
);

router.post(
  "/admin/create",
  [
    authenticate,
    authorize("system_admin"),
    body("type").notEmpty().withMessage("Notification type is required"),
    body("title").notEmpty().withMessage("Title is required"),
    body("message").notEmpty().withMessage("Message is required"),
    body("priority")
      .optional()
      .isIn(["low", "medium", "high", "critical"])
      .withMessage("Invalid priority"),
    body("targetRoles")
      .optional()
      .isArray()
      .withMessage("Target roles must be an array"),
    body("targetUsers")
      .optional()
      .isArray()
      .withMessage("Target users must be an array"),
    validate,
  ],
  notificationController.createNotification,
);

router.delete(
  "/admin/:id",
  [authenticate, authorize("system_admin")],
  notificationController.deleteNotification,
);

router.post(
  "/admin/trigger-checks",
  [authenticate, authorize("system_admin")],
  notificationController.triggerPeriodicChecks,
);

// Email testing routes
router.post(
  "/admin/test-email",
  [
    authenticate,
    authorize("system_admin"),
    body("email").optional().isEmail().withMessage("Invalid email format"),
    validate,
  ],
  notificationController.testEmailConfig,
);

router.get(
  "/admin/email-status",
  [authenticate, authorize("system_admin")],
  notificationController.getEmailStatus,
);

module.exports = router;
