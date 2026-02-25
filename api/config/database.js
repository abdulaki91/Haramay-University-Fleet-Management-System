const mysql = require("mysql2/promise");
const { createTables } = require("./createTables");
require("dotenv").config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
});

// Initialize database - create tables if they don't exist
const initializeDatabase = async () => {
  let connection;

  try {
    // First connect without database to create it if needed
    const tempConnection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 3306,
    });

    // Create database if not exists
    await tempConnection.query(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`,
    );
    await tempConnection.end();

    // Now connect to the database and create tables
    connection = await pool.getConnection();
    console.log("✓ Database connected successfully");

    // Create all tables
    await createTables(connection);
    console.log("✓ Database tables initialized");

    connection.release();
  } catch (error) {
    console.error("✗ Database initialization failed:", error.message);
    process.exit(1);
  }
};

module.exports = { pool, initializeDatabase };
