const fs = require("fs");
const path = require("path");
const { initializeDatabase } = require("./config/database");

async function setupNotifications() {
  try {
    console.log("Setting up notification system...");

    // Initialize database connection first
    await initializeDatabase();

    const { pool } = require("./config/database");

    // Read and execute the notification tables SQL
    const sqlPath = path.join(
      __dirname,
      "migrations",
      "create_notifications_tables.sql",
    );
    const sql = fs.readFileSync(sqlPath, "utf8");

    // Split by semicolon and execute each statement
    const statements = sql.split(";").filter((stmt) => stmt.trim().length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await pool.query(statement);
        } catch (error) {
          // Ignore "table already exists" errors
          if (!error.message.includes("already exists")) {
            throw error;
          }
        }
      }
    }

    console.log("✓ Notification tables created successfully");
    console.log("✓ Default notification types inserted");
    console.log("✓ Notification system setup complete");

    process.exit(0);
  } catch (error) {
    console.error("✗ Error setting up notifications:", error.message);
    process.exit(1);
  }
}

setupNotifications();
