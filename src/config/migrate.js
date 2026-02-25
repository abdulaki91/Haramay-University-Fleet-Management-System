const mysql = require("mysql2/promise");
const { createTables } = require("./createTables");
require("dotenv").config();

async function migrate() {
  let connection;

  try {
    // Connect without database first
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 3306,
    });

    // Create database if not exists
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`,
    );
    console.log(`✓ Database '${process.env.DB_NAME}' ready`);

    // Use the database
    await connection.query(`USE ${process.env.DB_NAME}`);

    // Create all tables
    await createTables(connection);

    console.log("✓ Migration completed successfully");
  } catch (error) {
    console.error("✗ Migration failed:", error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit(0);
  }
}

migrate();
