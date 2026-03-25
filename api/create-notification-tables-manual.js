const { initializeDatabase } = require("./config/database");

async function createNotificationTables() {
  try {
    console.log("Manually creating notification tables...");

    // Initialize database
    await initializeDatabase();
    const { pool } = require("./config/database");

    // Create notification_types table
    console.log("Creating notification_types table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notification_types (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) UNIQUE NOT NULL,
        description VARCHAR(255),
        default_channels JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create notifications table
    console.log("Creating notifications table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
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
      )
    `);

    // Create user_notifications table
    console.log("Creating user_notifications table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_notifications (
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
      )
    `);

    // Create notification_preferences table
    console.log("Creating notification_preferences table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notification_preferences (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        notification_type_id INT NOT NULL,
        channels JSON,
        enabled BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_notification_preferences_user (user_id),
        INDEX idx_notification_preferences_type (notification_type_id),
        UNIQUE KEY unique_user_type_preference (user_id, notification_type_id)
      )
    `);

    // Insert default notification types
    console.log("Inserting default notification types...");
    await pool.query(`
      INSERT IGNORE INTO notification_types (name, description, default_channels) VALUES
      ('maintenance_due', 'Vehicle maintenance is due or overdue', '["web", "email"]'),
      ('fuel_low', 'Vehicle fuel level is low and needs refill', '["web", "email"]'),
      ('schedule_assigned', 'New schedule has been assigned to driver', '["web", "email"]'),
      ('schedule_updated', 'Existing schedule has been modified', '["web", "email"]'),
      ('schedule_cancelled', 'Schedule has been cancelled', '["web", "email"]'),
      ('exit_request_approved', 'Exit request has been approved', '["web", "email"]'),
      ('exit_request_rejected', 'Exit request has been rejected', '["web", "email"]'),
      ('maintenance_completed', 'Vehicle maintenance has been completed', '["web", "email"]'),
      ('vehicle_status_changed', 'Vehicle status has been updated', '["web", "email"]'),
      ('system_alert', 'Important system-wide notifications', '["web", "email"]')
    `);

    console.log("✓ All notification tables created successfully");
    console.log("✓ Default notification types inserted");

    // Verify tables exist
    const [tables] = await pool.query("SHOW TABLES LIKE '%notification%'");
    console.log(
      "✓ Notification tables found:",
      tables.map((t) => Object.values(t)[0]),
    );

    process.exit(0);
  } catch (error) {
    console.error("✗ Error creating notification tables:", error.message);
    process.exit(1);
  }
}

createNotificationTables();
