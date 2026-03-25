require("dotenv").config();
const mysql = require("mysql2/promise");

async function simpleTest() {
  let connection;
  try {
    console.log("Testing direct database connection...");

    // Create direct connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "haramaya_fleet",
      port: process.env.DB_PORT || 3306,
    });

    console.log("✓ Connected to database");

    // Check if notifications table exists
    const [tables] = await connection.query("SHOW TABLES LIKE 'notifications'");
    console.log("Notifications table exists:", tables.length > 0);

    if (tables.length === 0) {
      console.log("Creating notifications table...");
      await connection.query(`
        CREATE TABLE notifications (
          id INT PRIMARY KEY AUTO_INCREMENT,
          type_id INT NOT NULL,
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
          target_roles JSON,
          target_users JSON,
          metadata JSON,
          channels JSON,
          scheduled_at TIMESTAMP NULL,
          expires_at TIMESTAMP NULL,
          processed_at TIMESTAMP NULL,
          created_by INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("✓ Notifications table created");
    }

    // Check notification types
    const [types] = await connection.query(
      "SELECT COUNT(*) as count FROM notification_types",
    );
    console.log("Notification types count:", types[0].count);

    if (types[0].count === 0) {
      console.log("Inserting notification types...");
      await connection.query(`
        INSERT INTO notification_types (name, description, default_channels) VALUES
        ('system_alert', 'Important system-wide notifications', '["web", "email"]')
      `);
      console.log("✓ Notification types inserted");
    }

    // Test creating a notification
    console.log("Testing notification creation...");
    const [result] = await connection.query(`
      INSERT INTO notifications 
      (type_id, title, message, priority, target_roles, target_users, metadata, channels, created_by) 
      VALUES (1, 'Test Notification', 'This is a test', 'medium', '[]', '[1]', '{}', '["web"]', 1)
    `);

    console.log("✓ Test notification created with ID:", result.insertId);

    // Clean up test notification
    await connection.query("DELETE FROM notifications WHERE id = ?", [
      result.insertId,
    ]);
    console.log("✓ Test notification cleaned up");

    console.log("✓ All tests passed!");
  } catch (error) {
    console.error("✗ Test failed:", error.message);
    console.error("Error details:", error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

simpleTest();
