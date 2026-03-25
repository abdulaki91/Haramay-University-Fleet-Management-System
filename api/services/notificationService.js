const Notification = require("../models/Notification");
const UserNotification = require("../models/UserNotification");
const NotificationPreference = require("../models/NotificationPreference");
const User = require("../models/User");
const { emitToUser, emitToRole } = require("./socketService");

class NotificationService {
  // Get notification type ID by name
  static async getNotificationTypeId(typeName) {
    const { pool } = require("../config/database");
    const [rows] = await pool.query(
      "SELECT id FROM notification_types WHERE name = ?",
      [typeName],
    );
    return rows[0]?.id;
  }

  // Create and send notification
  static async createNotification({
    type,
    title,
    message,
    priority = "medium",
    targetRoles = [],
    targetUsers = [],
    metadata = {},
    scheduledAt = null,
    expiresAt = null,
    createdBy = null,
  }) {
    try {
      const typeId = await this.getNotificationTypeId(type);
      if (!typeId) {
        throw new Error(`Unknown notification type: ${type}`);
      }

      // Get default channels for this notification type
      const { pool } = require("../config/database");
      const [typeRows] = await pool.query(
        "SELECT default_channels FROM notification_types WHERE id = ?",
        [typeId],
      );
      const defaultChannels = JSON.parse(typeRows[0].default_channels);

      // Create the notification
      const notificationId = await Notification.create({
        type_id: typeId,
        title,
        message,
        priority,
        target_roles: targetRoles,
        target_users: targetUsers,
        metadata,
        channels: defaultChannels,
        scheduled_at: scheduledAt,
        expires_at: expiresAt,
        created_by: createdBy,
      });

      // Process immediately if not scheduled
      if (!scheduledAt || new Date(scheduledAt) <= new Date()) {
        await this.processNotification(notificationId);
      }

      return notificationId;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  // Process a notification and send to users
  static async processNotification(notificationId) {
    try {
      const notification = await Notification.findById(notificationId);
      if (!notification) return;

      const targetUsers = await this.resolveTargetUsers(notification);

      for (const userId of targetUsers) {
        const effectiveChannels =
          await NotificationPreference.getEffectiveChannels(
            userId,
            notification.type_id,
          );

        for (const channel of effectiveChannels) {
          await UserNotification.create({
            notification_id: notificationId,
            user_id: userId,
            channel,
            status: "pending",
          });
        }
      }

      // Send web notifications immediately via WebSocket
      await this.sendWebNotifications(notificationId);

      // Mark as processed
      await Notification.markAsProcessed(notificationId);
    } catch (error) {
      console.error("Error processing notification:", error);
    }
  }

  // Resolve target users from roles and specific user IDs
  static async resolveTargetUsers(notification) {
    const userIds = new Set();

    // Add specific target users
    if (notification.target_users) {
      const targetUsers = JSON.parse(notification.target_users);
      targetUsers.forEach((id) => userIds.add(id));
    }

    // Add users from target roles
    if (notification.target_roles) {
      const targetRoles = JSON.parse(notification.target_roles);
      for (const roleName of targetRoles) {
        const users = await User.findByRole(roleName);
        users.forEach((user) => userIds.add(user.id));
      }
    }

    return Array.from(userIds);
  }

  // Send web notifications via WebSocket
  static async sendWebNotifications(notificationId) {
    try {
      const webNotifications =
        await UserNotification.findPendingByChannel("web");

      for (const userNotif of webNotifications) {
        if (userNotif.notification_id === notificationId) {
          // Emit to specific user
          emitToUser(userNotif.user_id, "notification:new", {
            id: userNotif.id,
            title: userNotif.title,
            message: userNotif.message,
            priority: userNotif.priority,
            type: userNotif.type_name,
            metadata: JSON.parse(userNotif.metadata || "{}"),
            createdAt: userNotif.notification_created_at,
          });

          // Mark as sent
          await UserNotification.updateStatus(userNotif.id, "sent");
        }
      }
    } catch (error) {
      console.error("Error sending web notifications:", error);
    }
  }

  // Maintenance due notifications
  static async checkMaintenanceDue() {
    try {
      // Get vehicles that need maintenance (example: every 10,000 km or 6 months)
      const { pool } = require("../config/database");
      const [vehicles] = await pool.query(`
        SELECT v.*, 
               COALESCE(MAX(fr.odometer_reading), v.mileage) as current_mileage,
               COALESCE(MAX(mr.completed_at), v.registered_at) as last_maintenance
        FROM vehicles v
        LEFT JOIN fuel_records fr ON v.id = fr.vehicle_id
        LEFT JOIN maintenance_requests mr ON v.id = mr.vehicle_id AND mr.status = 'completed'
        WHERE v.status IN ('available', 'in_use')
        GROUP BY v.id
        HAVING (current_mileage - COALESCE(
          (SELECT MAX(fr2.odometer_reading) 
           FROM fuel_records fr2 
           JOIN maintenance_requests mr2 ON fr2.vehicle_id = mr2.vehicle_id 
           WHERE mr2.completed_at = last_maintenance AND fr2.fueled_at <= mr2.completed_at), 
          0)) >= 10000
        OR DATEDIFF(NOW(), last_maintenance) >= 180
      `);

      for (const vehicle of vehicles) {
        await this.createNotification({
          type: "maintenance_due",
          title: `Maintenance Due - ${vehicle.plate_number}`,
          message: `Vehicle ${vehicle.plate_number} (${vehicle.make} ${vehicle.model}) is due for maintenance. Current mileage: ${vehicle.current_mileage} km.`,
          priority: "high",
          targetRoles: ["vehicle_manager", "mechanic"],
          metadata: {
            vehicle_id: vehicle.id,
            plate_number: vehicle.plate_number,
            current_mileage: vehicle.current_mileage,
            last_maintenance: vehicle.last_maintenance,
          },
        });
      }
    } catch (error) {
      console.error("Error checking maintenance due:", error);
    }
  }

  // Low fuel notifications
  static async checkLowFuel() {
    try {
      // Get vehicles with low fuel (less than 25% based on last fuel record)
      const { pool } = require("../config/database");
      const [vehicles] = await pool.query(`
        SELECT v.*, fr.fuel_amount, fr.odometer_reading, fr.fueled_at,
               (SELECT AVG(fuel_amount) FROM fuel_records WHERE vehicle_id = v.id) as avg_fuel
        FROM vehicles v
        JOIN fuel_records fr ON v.id = fr.vehicle_id
        WHERE v.status IN ('available', 'in_use')
        AND fr.fueled_at = (
          SELECT MAX(fueled_at) 
          FROM fuel_records 
          WHERE vehicle_id = v.id
        )
        AND DATEDIFF(NOW(), fr.fueled_at) >= 7 -- No fuel record in last 7 days
        AND fr.fuel_amount < (
          SELECT AVG(fuel_amount) * 0.25 
          FROM fuel_records 
          WHERE vehicle_id = v.id
        )
      `);

      for (const vehicle of vehicles) {
        await this.createNotification({
          type: "fuel_low",
          title: `Low Fuel Alert - ${vehicle.plate_number}`,
          message: `Vehicle ${vehicle.plate_number} may be running low on fuel. Last refuel was ${Math.floor((Date.now() - new Date(vehicle.fueled_at)) / (1000 * 60 * 60 * 24))} days ago.`,
          priority: "medium",
          targetRoles: ["vehicle_manager"],
          targetUsers: [vehicle.driver_id], // If there's a current driver
          metadata: {
            vehicle_id: vehicle.id,
            plate_number: vehicle.plate_number,
            last_fuel_amount: vehicle.fuel_amount,
            days_since_refuel: Math.floor(
              (Date.now() - new Date(vehicle.fueled_at)) /
                (1000 * 60 * 60 * 24),
            ),
          },
        });
      }
    } catch (error) {
      console.error("Error checking low fuel:", error);
    }
  }

  // Low fuel notifications
  static async checkLowFuel() {
    try {
      // Get vehicles with low fuel (less than 25% based on last fuel record)
      const { pool } = require("../config/database");
      const [vehicles] = await pool.query(`
        SELECT v.*, fr.fuel_amount, fr.odometer_reading, fr.fueled_at,
               (SELECT AVG(fuel_amount) FROM fuel_records WHERE vehicle_id = v.id) as avg_fuel
        FROM vehicles v
        JOIN fuel_records fr ON v.id = fr.vehicle_id
        WHERE v.status IN ('available', 'in_use')
        AND fr.fueled_at = (
          SELECT MAX(fueled_at) 
          FROM fuel_records 
          WHERE vehicle_id = v.id
        )
        AND DATEDIFF(NOW(), fr.fueled_at) >= 7 -- No fuel record in last 7 days
        AND fr.fuel_amount < (
          SELECT AVG(fuel_amount) * 0.25 
          FROM fuel_records 
          WHERE vehicle_id = v.id
        )
      `);

      for (const vehicle of vehicles) {
        await this.createNotification({
          type: "fuel_low",
          title: `Low Fuel Alert - ${vehicle.plate_number}`,
          message: `Vehicle ${vehicle.plate_number} may be running low on fuel. Last refuel was ${Math.floor((Date.now() - new Date(vehicle.fueled_at)) / (1000 * 60 * 60 * 24))} days ago.`,
          priority: "medium",
          targetRoles: ["vehicle_manager"],
          metadata: {
            vehicle_id: vehicle.id,
            plate_number: vehicle.plate_number,
            last_fuel_amount: vehicle.fuel_amount,
            days_since_refuel: Math.floor(
              (Date.now() - new Date(vehicle.fueled_at)) /
                (1000 * 60 * 60 * 24),
            ),
          },
        });
      }
    } catch (error) {
      console.error("Error checking low fuel:", error);
    }
  }

  // Schedule assignment notification
  static async notifyScheduleAssignment(scheduleId, driverId, createdBy) {
    try {
      const Schedule = require("../models/Schedule");
      const schedule = await Schedule.findById(scheduleId);

      if (schedule) {
        await this.createNotification({
          type: "schedule_assigned",
          title: "New Schedule Assignment",
          message: `You have been assigned a new schedule: ${schedule.purpose} to ${schedule.destination} on ${new Date(schedule.start_date).toLocaleDateString()}.`,
          priority: "medium",
          targetUsers: [driverId],
          metadata: {
            schedule_id: scheduleId,
            vehicle_plate: schedule.plate_number,
            destination: schedule.destination,
            departure_time: schedule.start_date,
          },
          createdBy,
        });
      }
    } catch (error) {
      console.error("Error notifying schedule assignment:", error);
    }
  }

  // Exit request status notification
  static async notifyExitRequestStatus(exitRequestId, status, reason = null) {
    try {
      const ExitRequest = require("../models/ExitRequest");
      const exitRequest = await ExitRequest.findById(exitRequestId);

      if (exitRequest) {
        const type =
          status === "approved"
            ? "exit_request_approved"
            : "exit_request_rejected";
        const title =
          status === "approved"
            ? "Exit Request Approved"
            : "Exit Request Rejected";
        const message =
          status === "approved"
            ? `Your exit request for ${exitRequest.destination} has been approved.`
            : `Your exit request for ${exitRequest.destination} has been rejected. Reason: ${reason}`;

        await this.createNotification({
          type,
          title,
          message,
          priority: "medium",
          targetUsers: [exitRequest.driver_id],
          metadata: {
            exit_request_id: exitRequestId,
            destination: exitRequest.destination,
            reason: reason,
          },
        });
      }
    } catch (error) {
      console.error("Error notifying exit request status:", error);
    }
  }

  // Run periodic checks (called by cron job)
  static async runPeriodicChecks() {
    console.log("Running periodic notification checks...");
    await this.checkMaintenanceDue();
    await this.checkLowFuel();
    console.log("Periodic notification checks completed.");
  }
}

module.exports = NotificationService;
