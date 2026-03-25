require("dotenv").config();
const mysql = require("mysql2/promise");

async function quickTest() {
  let connection;
  try {
    console.log("Quick notification system test...");

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "haramaya_fleet",
      port: process.env.DB_PORT || 3306,
    });

    console.log("✓ Connected to database");

    // Check if notification tables exist
    const [tables] = await connection.query(
      "SHOW TABLES LIKE '%notification%'",
    );
    console.log("Notification tables found:");
    tables.forEach((table) => {
      console.log("  ✓", Object.values(table)[0]);
    });

    // Check notification types
    const [types] = await connection.query(
      "SELECT COUNT(*) as count FROM notification_types",
    );
    console.log(`✓ Notification types: ${types[0].count}`);

    // Test creating a notification
    console.log("Testing notification creation...");
    const [result] = await connection.query(`
      INSERT INTO notifications 
      (type_id, title, message, priority, target_roles, target_users, metadata, channels, created_by) 
      VALUES (1, 'Test Notification', 'System is working!', 'medium', '[]', '[1]', '{}', '["web"]', 1)
    `);
    console.log("✓ Test notification created with ID:", result.insertId);

    // Verify the notification
    const [notifications] = await connection.query(
      "SELECT * FROM notifications WHERE id = ?",
      [result.insertId],
    );
    console.log("✓ Notification verified:", notifications[0].title);

    // Clean up
    await connection.query("DELETE FROM notifications WHERE id = ?", [
      result.insertId,
    ]);
    console.log("✓ Test notification cleaned up");

    console.log("\n🎉 Notification system is working perfectly!");
    console.log(
      "📧 You can now test email notifications from the admin panel!",
    );
  } catch (error) {
    console.error("✗ Test failed:", error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

quickTest();
