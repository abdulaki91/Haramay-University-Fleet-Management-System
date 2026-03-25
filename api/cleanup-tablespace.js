require("dotenv").config();
const mysql = require("mysql2/promise");

async function cleanupTablespace() {
  let connection;
  try {
    console.log("Cleaning up tablespace...");

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "haramaya_fleet",
      port: process.env.DB_PORT || 3306,
    });

    console.log("✓ Connected to database");

    // First, let's try to discard the tablespace
    console.log("Attempting to discard tablespace...");
    try {
      await connection.query("ALTER TABLE notifications DISCARD TABLESPACE");
      console.log("✓ Tablespace discarded");
    } catch (error) {
      console.log("Note: Could not discard tablespace:", error.message);
    }

    // Try to drop the table again
    console.log("Dropping notifications table...");
    try {
      await connection.query("DROP TABLE IF EXISTS notifications");
      console.log("✓ Dropped notifications table");
    } catch (error) {
      console.log("Note: Could not drop table:", error.message);
    }

    // Drop user_notifications as well
    try {
      await connection.query("DROP TABLE IF EXISTS user_notifications");
      console.log("✓ Dropped user_notifications table");
    } catch (error) {
      console.log("Note: Could not drop user_notifications:", error.message);
    }

    // Create notifications table with a different name first, then rename
    console.log("Creating notifications_new table...");
    await connection.query(`
      CREATE TABLE notifications_new (
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_notifications_type (type_id),
        INDEX idx_notifications_scheduled (scheduled_at),
        INDEX idx_notifications_priority (priority)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✓ Created notifications_new table");

    // Rename to notifications
    console.log("Renaming table...");
    await connection.query("RENAME TABLE notifications_new TO notifications");
    console.log("✓ Renamed to notifications");

    // Create user_notifications table
    console.log("Creating user_notifications table...");
    await connection.query(`
      CREATE TABLE user_notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        notification_id INT NOT NULL,
        user_id INT NOT NULL,
        channel ENUM('web', 'email', 'sms') NOT NULL,
        status ENUM('pending', 'sent', 'delivered', 'read', 'failed') DEFAULT 'pending',
        sent_at TIMESTAMP NULL,
        read_at TIMESTAMP NULL,
        error_message TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_notifications_user (user_id),
        INDEX idx_user_notifications_status (status),
        INDEX idx_user_notifications_notification (notification_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✓ Created user_notifications table");

    // Test the table
    console.log("Testing notifications table...");
    const [result] = await connection.query(`
      INSERT INTO notifications 
      (type_id, title, message, priority, target_roles, target_users, metadata, channels, created_by) 
      VALUES (1, 'Test Notification', 'This is a test', 'medium', '[]', '[1]', '{}', '["web"]', 1)
    `);
    console.log("✓ Test notification created with ID:", result.insertId);

    // Verify the record
    const [rows] = await connection.query(
      "SELECT * FROM notifications WHERE id = ?",
      [result.insertId],
    );
    console.log("✓ Test notification verified:", rows[0].title);

    // Clean up test record
    await connection.query("DELETE FROM notifications WHERE id = ?", [
      result.insertId,
    ]);
    console.log("✓ Test notification cleaned up");

    console.log("✅ Tablespace cleanup completed successfully!");
  } catch (error) {
    console.error("✗ Cleanup failed:", error.message);
    console.error("Full error:", error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

cleanupTablespace();
