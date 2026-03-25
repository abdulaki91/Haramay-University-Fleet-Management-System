const { initializeDatabase } = require("./config/database");
const NotificationService = require("./services/notificationService");

async function testNotifications() {
  try {
    console.log("Testing notification system...");

    // Initialize database
    await initializeDatabase();

    // Test creating a simple notification
    console.log("Creating test notification...");
    const notificationId = await NotificationService.createNotification({
      type: "system_alert",
      title: "Test Notification",
      message: "This is a test notification to verify the system is working.",
      priority: "medium",
      targetUsers: [1], // Assuming user ID 1 exists
    });

    console.log(`✓ Test notification created with ID: ${notificationId}`);

    // Test periodic checks
    console.log("Running periodic checks...");
    await NotificationService.runPeriodicChecks();
    console.log("✓ Periodic checks completed");

    console.log("✓ Notification system test completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("✗ Notification test failed:", error.message);
    process.exit(1);
  }
}

testNotifications();
