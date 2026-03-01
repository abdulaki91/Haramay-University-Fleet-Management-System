const { pool } = require("./database");

async function reset() {
  let connection;

  try {
    connection = await pool.getConnection();

    console.log("Resetting database...");

    // Drop all tables in correct order (respecting foreign keys)
    const tables = [
      "exit_requests",
      "maintenance_requests",
      "fuel_records",
      "schedules",
      "vehicles",
      "users",
      "roles",
    ];

    for (const table of tables) {
      await connection.query(`DROP TABLE IF EXISTS ${table}`);
      console.log(`✓ Dropped table: ${table}`);
    }

    console.log("\n✓ Database reset completed successfully");
    console.log("Run 'npm run migrate' to recreate tables");
    console.log("Then run 'npm run seed' to add default data");
  } catch (error) {
    console.error("✗ Reset failed:", error.message);
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
    }
    process.exit(0);
  }
}

reset();
