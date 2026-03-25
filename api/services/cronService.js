const cron = require("node-cron");
const NotificationService = require("./notificationService");

class CronService {
  static init() {
    try {
      console.log("Initializing notification cron jobs...");

      // Run maintenance and fuel checks every day at 8 AM
      cron.schedule("0 8 * * *", async () => {
        console.log("Running daily notification checks...");
        try {
          await NotificationService.runPeriodicChecks();
        } catch (error) {
          console.error("Error in daily notification checks:", error);
        }
      });

      // Run fuel checks every 4 hours (more frequent monitoring)
      cron.schedule("0 */4 * * *", async () => {
        console.log("Running fuel level checks...");
        try {
          await NotificationService.checkLowFuel();
        } catch (error) {
          console.error("Error in fuel level checks:", error);
        }
      });

      // Run critical fuel checks every hour during business hours (8 AM - 6 PM)
      cron.schedule("0 8-18 * * *", async () => {
        console.log("Running critical fuel level checks...");
        try {
          await NotificationService.checkLowFuel();
        } catch (error) {
          console.error("Error in critical fuel level checks:", error);
        }
      });

      // Run maintenance checks every Monday at 9 AM
      cron.schedule("0 9 * * 1", async () => {
        console.log("Running weekly maintenance checks...");
        try {
          await NotificationService.checkMaintenanceDue();
        } catch (error) {
          console.error("Error in maintenance checks:", error);
        }
      });

      console.log("✓ Notification cron jobs initialized");
    } catch (error) {
      console.error("✗ Failed to initialize cron jobs:", error.message);
      console.log("⚠ Continuing without automated notifications...");
    }
  }

  static async runManualCheck() {
    console.log("Running manual notification checks...");
    await NotificationService.runPeriodicChecks();
  }
}

module.exports = CronService;
