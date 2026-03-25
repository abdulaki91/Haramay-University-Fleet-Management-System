require("dotenv").config();
const mysql = require("mysql2/promise");

async function recreateDatabase() {
  let connection;
  try {
    console.log("Recreating database from scratch...");

    // Connect without specifying database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      port: process.env.DB_PORT || 3306,
    });

    console.log("✓ Connected to MySQL server");

    const dbName = process.env.DB_NAME || "haramaya_fleet";

    // Drop the database
    console.log(`Dropping database ${dbName}...`);
    await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
    console.log("✓ Database dropped");

    // Create the database
    console.log(`Creating database ${dbName}...`);
    await connection.query(
      `CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    console.log("✓ Database created");

    // Switch to the new database
    await connection.query(`USE \`${dbName}\``);
    console.log("✓ Switched to new database");

    console.log("🎉 Database recreated successfully!");
    console.log("📝 Next steps:");
    console.log("   1. Run: node config/createTables.js");
    console.log("   2. Run: node setup-notifications.js");
    console.log("   3. Start the server: npm start");
  } catch (error) {
    console.error("✗ Database recreation failed:", error.message);
    console.error("Full error:", error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

recreateDatabase();
