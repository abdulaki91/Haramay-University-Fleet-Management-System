require("dotenv").config();
const mysql = require("mysql2/promise");

async function debugTables() {
  let connection;
  try {
    console.log("Debugging table structure...");

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "haramaya_fleet",
      port: process.env.DB_PORT || 3306,
    });

    console.log("✓ Connected to database");

    // Show current database
    const [dbResult] = await connection.query("SELECT DATABASE() as db");
    console.log("Current database:", dbResult[0].db);

    // Show all tables
    const [allTables] = await connection.query("SHOW TABLES");
    console.log("\nAll tables:");
    allTables.forEach((table) => {
      console.log("  -", Object.values(table)[0]);
    });

    // Check notifications table specifically
    const [notifTables] = await connection.query(
      "SHOW TABLES LIKE 'notifications'",
    );
    console.log("\nNotifications table check:", notifTables);

    // Describe notifications table
    try {
      const [structure] = await connection.query("DESCRIBE notifications");
      console.log("\nNotifications table structure:");
      structure.forEach((col) => {
        console.log(
          `  - ${col.Field}: ${col.Type} ${col.Null} ${col.Key} ${col.Default}`,
        );
      });
    } catch (error) {
      console.log("Error describing notifications table:", error.message);
    }

    // Try to select from notifications table
    try {
      const [rows] = await connection.query(
        "SELECT COUNT(*) as count FROM notifications",
      );
      console.log("\nNotifications count:", rows[0].count);
    } catch (error) {
      console.log("Error selecting from notifications:", error.message);
    }

    // Check MySQL version and engine
    const [version] = await connection.query("SELECT VERSION() as version");
    console.log("\nMySQL version:", version[0].version);

    // Check table engine
    try {
      const [engine] = await connection.query(
        `
        SELECT ENGINE 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'notifications'
      `,
        [process.env.DB_NAME || "haramaya_fleet"],
      );
      console.log("Table engine:", engine[0]?.ENGINE || "Not found");
    } catch (error) {
      console.log("Error checking engine:", error.message);
    }
  } catch (error) {
    console.error("✗ Debug failed:", error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

debugTables();
