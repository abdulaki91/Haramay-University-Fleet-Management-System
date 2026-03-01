const { pool } = require("../config/database");

async function runMigration() {
  let connection;
  try {
    connection = await pool.getConnection();

    console.log("Running password_changed migration...");

    // Step 1: Add column
    await connection.query(`
      ALTER TABLE users 
      ADD COLUMN password_changed BOOLEAN DEFAULT FALSE AFTER is_active
    `);
    console.log("✓ Added password_changed column");

    // Step 2: Update existing users
    await connection.query(`
      UPDATE users 
      SET password_changed = FALSE 
      WHERE role_id != 1
    `);
    console.log("✓ Set existing users to require password change");

    // Step 3: Set admin as already changed
    await connection.query(`
      UPDATE users 
      SET password_changed = TRUE 
      WHERE role_id = 1
    `);
    console.log("✓ Set admin as password changed");

    console.log("\n✓ Migration completed successfully!");
  } catch (error) {
    if (error.code === "ER_DUP_FIELDNAME") {
      console.log("✓ Column already exists, skipping migration");
    } else {
      console.error("✗ Migration failed:", error.message);
      throw error;
    }
  } finally {
    if (connection) {
      connection.release();
    }
    process.exit(0);
  }
}

runMigration();
