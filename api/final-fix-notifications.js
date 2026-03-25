require("dotenv").config();
const mysql = require("mysql2/promise");

async function finalFixNotifications() {
  let connection;
  try {
    console.log("Final fix for notifications...");

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "haramaya_fleet",
      port: process.env.DB_PORT || 3306,
    });

    console.log("✓ Connected to database");

    // Check if notifications_new exists
    const [newTable] = await connection.query(
      "SHOW TABLES LIKE 'notifications_new'",
    );
    if (newTable.length > 0) {
      console.log("Found notifications_new table, using it...");

      // Test the notifications_new table
      const [result] = await connection.query(`
        INSERT INTO notifications_new 
        (type_id, title, message, priority, target_roles, target_users, metadata, channels, created_by) 
        VALUES (1, 'Test Notification', 'This is a test', 'medium', '[]', '[1]', '{}', '["web"]', 1)
      `);
      console.log(
        "✓ Test notification created in notifications_new with ID:",
        result.insertId,
      );

      // Clean up test
      await connection.query("DELETE FROM notifications_new WHERE id = ?", [
        result.insertId,
      ]);
      console.log("✓ Test cleaned up");

      // Drop the problematic notifications table completely
      console.log("Removing problematic notifications references...");
      try {
        await connection.query("DROP TABLE IF EXISTS notifications");
        console.log("✓ Dropped old notifications table");
      } catch (error) {
        console.log("Note: Could not drop notifications:", error.message);
      }

      // Now rename notifications_new to notifications
      try {
        await connection.query(
          "RENAME TABLE notifications_new TO notifications",
        );
        console.log("✓ Renamed notifications_new to notifications");
      } catch (error) {
        console.log("Could not rename, will keep notifications_new");
        // Update the model to use notifications_new instead
        console.log("Will update code to use notifications_new table");
      }
    } else {
      // Create fresh notifications table
      console.log("Creating fresh notifications table...");
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
        ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log("✓ Created notifications table with MyISAM engine");
    }

    // Ensure user_notifications exists
    const [userNotifTable] = await connection.query(
      "SHOW TABLES LIKE 'user_notifications'",
    );
    if (userNotifTable.length === 0) {
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
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log("✓ Created user_notifications table");
    }

    // Final test
    console.log("Final test...");
    const [finalResult] = await connection.query(`
      INSERT INTO notifications 
      (type_id, title, message, priority, target_roles, target_users, metadata, channels, created_by) 
      VALUES (1, 'Final Test', 'This is the final test', 'medium', '[]', '[1]', '{}', '["web"]', 1)
    `);
    console.log(
      "✓ Final test notification created with ID:",
      finalResult.insertId,
    );

    // Verify
    const [finalRows] = await connection.query(
      "SELECT * FROM notifications WHERE id = ?",
      [finalResult.insertId],
    );
    console.log("✓ Final test verified:", finalRows[0].title);

    // Clean up
    await connection.query("DELETE FROM notifications WHERE id = ?", [
      finalResult.insertId,
    ]);
    console.log("✓ Final test cleaned up");

    console.log("🎉 Notifications system is now working!");
  } catch (error) {
    console.error("✗ Final fix failed:", error.message);
    console.error("Full error:", error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

finalFixNotifications();
