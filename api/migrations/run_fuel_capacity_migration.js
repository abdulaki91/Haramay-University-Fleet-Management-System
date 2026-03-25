const { pool } = require("../config/database");

async function runFuelCapacityMigration() {
  let connection;

  try {
    connection = await pool.getConnection();

    console.log("Running fuel capacity migration...");

    // Check if fuel_capacity column exists
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'vehicles' 
      AND COLUMN_NAME = 'fuel_capacity'
    `);

    if (columns.length === 0) {
      // Add fuel_capacity column
      await connection.query(`
        ALTER TABLE vehicles 
        ADD COLUMN fuel_capacity DECIMAL(5, 2) DEFAULT 50.00 
        COMMENT 'Fuel tank capacity in liters'
      `);
      console.log("✓ Added fuel_capacity column to vehicles table");

      // Update existing vehicles with estimated fuel capacity
      await connection.query(`
        UPDATE vehicles SET fuel_capacity = 
          CASE 
            WHEN type LIKE '%truck%' OR type LIKE '%bus%' THEN 80.00
            WHEN type LIKE '%van%' THEN 60.00
            WHEN type LIKE '%suv%' THEN 70.00
            WHEN fuel_type = 'electric' THEN 0.00
            ELSE 50.00
          END
        WHERE fuel_capacity IS NULL OR fuel_capacity = 0
      `);
      console.log("✓ Updated existing vehicles with estimated fuel capacities");
    } else {
      console.log("✓ fuel_capacity column already exists");
    }

    console.log("✓ Fuel capacity migration completed successfully");
  } catch (error) {
    console.error("✗ Fuel capacity migration failed:", error.message);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Run if called directly
if (require.main === module) {
  runFuelCapacityMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = runFuelCapacityMigration;
