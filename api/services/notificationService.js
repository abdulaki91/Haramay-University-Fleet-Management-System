const Notification = require("../models/Notification");
const UserNotification = require("../models/UserNotification");
const NotificationPreference = require("../models/NotificationPreference");
const User = require("../models/User");
const { emitToUser, emitToRole } = require("./socketService");
const emailService = require("./emailService");

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

      // Send email notifications
      await this.sendEmailNotifications(notificationId);

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
      const targetUsers =
        typeof notification.target_users === "string"
          ? JSON.parse(notification.target_users)
          : notification.target_users;

      if (Array.isArray(targetUsers)) {
        targetUsers.forEach((id) => userIds.add(id));
      }
    }

    // Add users from target roles
    if (notification.target_roles) {
      const targetRoles =
        typeof notification.target_roles === "string"
          ? JSON.parse(notification.target_roles)
          : notification.target_roles;

      if (Array.isArray(targetRoles)) {
        for (const roleName of targetRoles) {
          const users = await User.findByRole(roleName);
          users.forEach((user) => userIds.add(user.id));
        }
      }
    }

    return Array.from(userIds);
  }

  // Send web notifications via WebSocket
  static async sendWebNotifications(notificationId) {
    try {
      const webNotifications = await UserNotification.findPendingByChannel(
        "web",
        notificationId,
      );

      for (const userNotif of webNotifications) {
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
    } catch (error) {
      console.error("Error sending web notifications:", error);
    }
  }

  // Send email notifications
  static async sendEmailNotifications(notificationId) {
    try {
      const emailNotifications = await UserNotification.findPendingByChannel(
        "email",
        notificationId,
      );

      for (const userNotif of emailNotifications) {
        try {
          // Get user email
          const userEmail = userNotif.email;
          if (!userEmail) {
            console.warn(`No email found for user ${userNotif.user_id}`);
            await UserNotification.updateStatus(
              userNotif.id,
              "failed",
              "No email address found",
            );
            continue;
          }

          // Prepare notification data
          const notificationData = {
            id: userNotif.id,
            title: userNotif.title,
            message: userNotif.message,
            priority: userNotif.priority,
            type: userNotif.type_name,
            metadata: JSON.parse(userNotif.metadata || "{}"),
            createdAt: userNotif.notification_created_at,
          };

          // Send email
          const result = await emailService.sendNotificationEmail(
            userEmail,
            notificationData,
          );

          if (result.success) {
            await UserNotification.updateStatus(userNotif.id, "sent");
            console.log(`✓ Email notification sent to ${userEmail}`);
          } else {
            await UserNotification.updateStatus(
              userNotif.id,
              "failed",
              result.error,
            );
            console.error(
              `✗ Failed to send email to ${userEmail}: ${result.error}`,
            );
          }
        } catch (error) {
          await UserNotification.updateStatus(
            userNotif.id,
            "failed",
            error.message,
          );
          console.error(`Error sending email notification:`, error);
        }
      }
    } catch (error) {
      console.error("Error processing email notifications:", error);
    }
  }

  // Maintenance due notifications
  static async checkMaintenanceDue() {
    try {
      // Get vehicles that need maintenance (simplified query)
      const { pool } = require("../config/database");
      const [vehicles] = await pool.query(`
        SELECT v.*, 
               COALESCE(MAX(fr.odometer_reading), v.mileage) as current_mileage,
               COALESCE(MAX(mr.completed_at), v.registered_at) as last_maintenance_date
        FROM vehicles v
        LEFT JOIN fuel_records fr ON v.id = fr.vehicle_id
        LEFT JOIN maintenance_requests mr ON v.id = mr.vehicle_id AND mr.status = 'completed'
        WHERE v.status IN ('available', 'in_use')
        GROUP BY v.id, v.plate_number, v.make, v.model, v.mileage, v.registered_at
      `);

      for (const vehicle of vehicles) {
        const currentMileage = vehicle.current_mileage || 0;
        const lastMaintenanceDate = new Date(vehicle.last_maintenance_date);
        const daysSinceLastMaintenance = Math.floor(
          (new Date() - lastMaintenanceDate) / (1000 * 60 * 60 * 24),
        );

        // Check if maintenance is due (10,000 km or 180 days)
        const needsMaintenance = daysSinceLastMaintenance >= 180;

        if (needsMaintenance) {
          await this.createNotification({
            type: "maintenance_due",
            title: `Maintenance Due - ${vehicle.plate_number}`,
            message: `Vehicle ${vehicle.plate_number} (${vehicle.make} ${vehicle.model}) is due for maintenance. Last maintenance: ${daysSinceLastMaintenance} days ago.`,
            priority: "high",
            targetRoles: ["vehicle_manager", "mechanic"],
            metadata: {
              vehicle_id: vehicle.id,
              plate_number: vehicle.plate_number,
              current_mileage: currentMileage,
              days_since_maintenance: daysSinceLastMaintenance,
              last_maintenance: vehicle.last_maintenance_date,
            },
          });
        }
      }
    } catch (error) {
      console.error("Error checking maintenance due:", error);
    }
  }

  // Enhanced low fuel notifications with multiple detection methods
  static async checkLowFuel() {
    try {
      console.log("Checking for low fuel conditions...");
      const { pool } = require("../config/database");

      // Method 1: Check vehicles with no recent fuel records (likely running low)
      const [vehiclesNoRecentFuel] = await pool.query(`
        SELECT v.id, v.plate_number, v.make, v.model, v.fuel_capacity,
               COALESCE(MAX(fr.fueled_at), v.registered_at) as last_fuel_date,
               COALESCE(MAX(fr.fuel_amount), 0) as last_fuel_amount,
               COALESCE(MAX(fr.odometer_reading), v.mileage) as last_odometer,
               DATEDIFF(NOW(), COALESCE(MAX(fr.fueled_at), v.registered_at)) as days_since_fuel
        FROM vehicles v
        LEFT JOIN fuel_records fr ON v.id = fr.vehicle_id
        WHERE v.status IN ('available', 'in_use')
        GROUP BY v.id, v.plate_number, v.make, v.model, v.fuel_capacity, v.registered_at, v.mileage
        HAVING days_since_fuel >= 14 -- No fuel record in 14+ days
      `);

      // Method 2: Check vehicles with low fuel amounts in recent records
      const [vehiclesLowFuelAmount] = await pool.query(`
        SELECT v.id, v.plate_number, v.make, v.model, v.fuel_capacity,
               fr.fuel_amount, fr.fueled_at, fr.odometer_reading,
               AVG(fr2.fuel_amount) as avg_fuel_amount
        FROM vehicles v
        JOIN fuel_records fr ON v.id = fr.vehicle_id
        LEFT JOIN fuel_records fr2 ON v.id = fr2.vehicle_id
        WHERE v.status IN ('available', 'in_use')
        AND fr.fueled_at = (SELECT MAX(fueled_at) FROM fuel_records WHERE vehicle_id = v.id)
        AND fr.fuel_amount < (v.fuel_capacity * 0.25) -- Less than 25% of tank capacity
        GROUP BY v.id, v.plate_number, v.make, v.model, v.fuel_capacity, fr.fuel_amount, fr.fueled_at, fr.odometer_reading
      `);

      // Method 3: Check vehicles with high mileage since last fuel (estimated consumption)
      const [vehiclesHighMileage] = await pool.query(`
        SELECT v.id, v.plate_number, v.make, v.model, v.fuel_capacity,
               fr.fuel_amount, fr.fueled_at, fr.odometer_reading,
               COALESCE(MAX(fr2.odometer_reading), v.mileage) as current_odometer,
               (COALESCE(MAX(fr2.odometer_reading), v.mileage) - fr.odometer_reading) as distance_since_fuel
        FROM vehicles v
        JOIN fuel_records fr ON v.id = fr.vehicle_id
        LEFT JOIN fuel_records fr2 ON v.id = fr2.vehicle_id AND fr2.fueled_at > fr.fueled_at
        WHERE v.status IN ('available', 'in_use')
        AND fr.fueled_at = (SELECT MAX(fueled_at) FROM fuel_records WHERE vehicle_id = v.id)
        GROUP BY v.id, v.plate_number, v.make, v.model, v.fuel_capacity, fr.fuel_amount, fr.fueled_at, fr.odometer_reading
        HAVING distance_since_fuel >= 500 -- More than 500km since last fuel
      `);

      // Process notifications for each detection method
      await this.processLowFuelNotifications(
        vehiclesNoRecentFuel,
        "no_recent_fuel",
      );
      await this.processLowFuelNotifications(
        vehiclesLowFuelAmount,
        "low_fuel_amount",
      );
      await this.processLowFuelNotifications(
        vehiclesHighMileage,
        "high_mileage",
      );

      console.log(
        `✓ Low fuel check completed. Found ${vehiclesNoRecentFuel.length + vehiclesLowFuelAmount.length + vehiclesHighMileage.length} potential issues.`,
      );
    } catch (error) {
      console.error("Error checking low fuel:", error);
    }
  }

  // Process low fuel notifications with different urgency levels
  static async processLowFuelNotifications(vehicles, detectionMethod) {
    for (const vehicle of vehicles) {
      let priority = "medium";
      let title = "";
      let message = "";
      let urgencyLevel = "";

      switch (detectionMethod) {
        case "no_recent_fuel":
          const daysSinceFuel = vehicle.days_since_fuel;
          if (daysSinceFuel >= 21) {
            priority = "critical";
            urgencyLevel = "CRITICAL";
          } else if (daysSinceFuel >= 14) {
            priority = "high";
            urgencyLevel = "HIGH";
          }

          title = `${urgencyLevel} Fuel Alert - ${vehicle.plate_number}`;
          message = `Vehicle ${vehicle.plate_number} (${vehicle.make} ${vehicle.model}) has not been refueled for ${daysSinceFuel} days. Last fuel record: ${new Date(vehicle.last_fuel_date).toLocaleDateString()}. Please check fuel level and refuel if necessary.`;
          break;

        case "low_fuel_amount":
          const fuelPercentage = (
            (vehicle.fuel_amount / vehicle.fuel_capacity) *
            100
          ).toFixed(1);
          if (fuelPercentage <= 10) {
            priority = "critical";
            urgencyLevel = "CRITICAL";
          } else if (fuelPercentage <= 25) {
            priority = "high";
            urgencyLevel = "HIGH";
          }

          title = `${urgencyLevel} Low Fuel - ${vehicle.plate_number}`;
          message = `Vehicle ${vehicle.plate_number} is running low on fuel (${fuelPercentage}% remaining - ${vehicle.fuel_amount}L). Last refueled: ${new Date(vehicle.fueled_at).toLocaleDateString()}. Immediate refueling recommended.`;
          break;

        case "high_mileage":
          const distance = vehicle.distance_since_fuel;
          if (distance >= 800) {
            priority = "high";
            urgencyLevel = "HIGH";
          } else if (distance >= 500) {
            priority = "medium";
            urgencyLevel = "MEDIUM";
          }

          title = `${urgencyLevel} Fuel Check Needed - ${vehicle.plate_number}`;
          message = `Vehicle ${vehicle.plate_number} has traveled ${distance}km since last refuel on ${new Date(vehicle.fueled_at).toLocaleDateString()}. Please check fuel level and refuel if necessary.`;
          break;
      }

      // Check if we already sent a similar notification recently (avoid spam)
      const recentNotification = await this.checkRecentFuelNotification(
        vehicle.id,
      );
      if (!recentNotification) {
        await this.createNotification({
          type: "fuel_low",
          title,
          message,
          priority,
          targetRoles: ["vehicle_manager"],
          metadata: {
            vehicle_id: vehicle.id,
            plate_number: vehicle.plate_number,
            detection_method: detectionMethod,
            fuel_amount: vehicle.fuel_amount || 0,
            fuel_capacity: vehicle.fuel_capacity || 0,
            days_since_fuel: vehicle.days_since_fuel || 0,
            distance_since_fuel: vehicle.distance_since_fuel || 0,
            last_fuel_date: vehicle.last_fuel_date,
            urgency_level: urgencyLevel,
          },
        });
      }
    }
  }

  // Check if we sent a fuel notification for this vehicle recently
  static async checkRecentFuelNotification(vehicleId) {
    try {
      const { pool } = require("../config/database");
      const [rows] = await pool.query(
        `
        SELECT n.id 
        FROM notifications n
        JOIN notification_types nt ON n.type_id = nt.id
        WHERE nt.name = 'fuel_low'
        AND JSON_EXTRACT(n.metadata, '$.vehicle_id') = ?
        AND n.created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
        LIMIT 1
      `,
        [vehicleId],
      );

      return rows.length > 0;
    } catch (error) {
      console.error("Error checking recent fuel notifications:", error);
      return false;
    }
  }

  // Emergency fuel alert for critical situations
  static async sendEmergencyFuelAlert(vehicleId, currentLocation = null) {
    try {
      const { pool } = require("../config/database");
      const [vehicleRows] = await pool.query(
        `
        SELECT v.*, CONCAT(u.first_name, ' ', u.last_name) as current_driver,
               u.phone as driver_phone, u.email as driver_email
        FROM vehicles v
        LEFT JOIN schedules s ON v.id = s.vehicle_id AND s.status = 'active'
        LEFT JOIN users u ON s.driver_id = u.id
        WHERE v.id = ?
      `,
        [vehicleId],
      );

      if (vehicleRows.length > 0) {
        const vehicle = vehicleRows[0];

        await this.createNotification({
          type: "fuel_low",
          title: `🚨 EMERGENCY: Vehicle Out of Fuel - ${vehicle.plate_number}`,
          message: `URGENT: Vehicle ${vehicle.plate_number} has run out of fuel${currentLocation ? ` at ${currentLocation}` : ""}. ${vehicle.current_driver ? `Driver: ${vehicle.current_driver} (${vehicle.driver_phone})` : "No active driver assigned"}. Immediate assistance required.`,
          priority: "critical",
          targetRoles: ["vehicle_manager", "system_admin"],
          targetUsers: vehicle.current_driver ? [vehicle.driver_id] : [],
          metadata: {
            vehicle_id: vehicleId,
            plate_number: vehicle.plate_number,
            emergency: true,
            current_location: currentLocation,
            driver_name: vehicle.current_driver,
            driver_phone: vehicle.driver_phone,
            alert_type: "emergency_fuel_out",
          },
        });
      }
    } catch (error) {
      console.error("Error sending emergency fuel alert:", error);
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

  // Maintenance request notifications
  static async notifyMaintenanceRequest(maintenanceRequestId, createdBy) {
    try {
      const MaintenanceRequest = require("../models/MaintenanceRequest");
      const maintenanceRequest =
        await MaintenanceRequest.findById(maintenanceRequestId);

      if (maintenanceRequest) {
        await this.createNotification({
          type: "maintenance_requested",
          title: "New Maintenance Request Submitted",
          message: `${maintenanceRequest.requested_by_name} has submitted a maintenance request for ${maintenanceRequest.plate_number}. Priority: ${maintenanceRequest.priority}. Issue: ${maintenanceRequest.description}`,
          priority:
            maintenanceRequest.priority === "critical" ? "high" : "medium",
          targetRoles: ["vehicle_manager", "mechanic", "system_admin"],
          metadata: {
            maintenance_request_id: maintenanceRequestId,
            vehicle_id: maintenanceRequest.vehicle_id,
            plate_number: maintenanceRequest.plate_number,
            requested_by_name: maintenanceRequest.requested_by_name,
            priority: maintenanceRequest.priority,
            description: maintenanceRequest.description,
          },
          createdBy,
        });
      }
    } catch (error) {
      console.error("Error notifying maintenance request:", error);
    }
  }

  // Maintenance assignment notification
  static async notifyMaintenanceAssignment(
    maintenanceRequestId,
    assignedToId,
    assignedBy,
  ) {
    try {
      const MaintenanceRequest = require("../models/MaintenanceRequest");
      const maintenanceRequest =
        await MaintenanceRequest.findById(maintenanceRequestId);

      if (maintenanceRequest && assignedToId) {
        await this.createNotification({
          type: "maintenance_assigned",
          title: "Maintenance Request Assigned to You",
          message: `You have been assigned a maintenance request for ${maintenanceRequest.plate_number}. Priority: ${maintenanceRequest.priority}. Issue: ${maintenanceRequest.description}`,
          priority:
            maintenanceRequest.priority === "critical" ? "high" : "medium",
          targetUsers: [assignedToId],
          metadata: {
            maintenance_request_id: maintenanceRequestId,
            vehicle_id: maintenanceRequest.vehicle_id,
            plate_number: maintenanceRequest.plate_number,
            priority: maintenanceRequest.priority,
            description: maintenanceRequest.description,
            assigned_by: assignedBy,
          },
          createdBy: assignedBy,
        });
      }
    } catch (error) {
      console.error("Error notifying maintenance assignment:", error);
    }
  }

  // Maintenance status update notification
  static async notifyMaintenanceStatusUpdate(
    maintenanceRequestId,
    oldStatus,
    newStatus,
    updatedBy,
  ) {
    try {
      const MaintenanceRequest = require("../models/MaintenanceRequest");
      const maintenanceRequest =
        await MaintenanceRequest.findById(maintenanceRequestId);

      if (maintenanceRequest) {
        let title = "Maintenance Request Updated";
        let message = `Your maintenance request for ${maintenanceRequest.plate_number} has been updated from "${oldStatus}" to "${newStatus}".`;
        let priority = "medium";

        // Customize message based on status
        switch (newStatus) {
          case "in_progress":
            title = "Maintenance Work Started";
            message = `Maintenance work has started on ${maintenanceRequest.plate_number}. ${maintenanceRequest.assigned_to_name ? `Assigned to: ${maintenanceRequest.assigned_to_name}` : ""}`;
            break;
          case "completed":
            title = "Maintenance Work Completed";
            message = `Maintenance work on ${maintenanceRequest.plate_number} has been completed. The vehicle is ready for use.`;
            priority = "high";
            break;
          case "cancelled":
            title = "Maintenance Request Cancelled";
            message = `Your maintenance request for ${maintenanceRequest.plate_number} has been cancelled.`;
            break;
        }

        await this.createNotification({
          type:
            newStatus === "completed"
              ? "maintenance_completed"
              : "maintenance_status_updated",
          title,
          message,
          priority,
          targetUsers: [maintenanceRequest.requested_by],
          metadata: {
            maintenance_request_id: maintenanceRequestId,
            vehicle_id: maintenanceRequest.vehicle_id,
            plate_number: maintenanceRequest.plate_number,
            old_status: oldStatus,
            new_status: newStatus,
            assigned_to_name: maintenanceRequest.assigned_to_name,
            updated_by: updatedBy,
          },
          createdBy: updatedBy,
        });
      }
    } catch (error) {
      console.error("Error notifying maintenance status update:", error);
    }
  }

  // Exit request submission notification
  static async notifyExitRequestSubmission(exitRequestId, createdBy) {
    try {
      const ExitRequest = require("../models/ExitRequest");
      const exitRequest = await ExitRequest.findById(exitRequestId);

      if (exitRequest) {
        await this.createNotification({
          type: "exit_request_submitted",
          title: "New Exit Request Submitted",
          message: `${exitRequest.driver_name} has submitted an exit request for ${exitRequest.destination}. Vehicle: ${exitRequest.plate_number}. Purpose: ${exitRequest.purpose}.`,
          priority: "medium",
          targetRoles: ["vehicle_manager", "system_admin"],
          metadata: {
            exit_request_id: exitRequestId,
            vehicle_id: exitRequest.vehicle_id,
            plate_number: exitRequest.plate_number,
            driver_name: exitRequest.driver_name,
            destination: exitRequest.destination,
            purpose: exitRequest.purpose,
            expected_return: exitRequest.expected_return,
          },
          createdBy,
        });
      }
    } catch (error) {
      console.error("Error notifying exit request submission:", error);
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
