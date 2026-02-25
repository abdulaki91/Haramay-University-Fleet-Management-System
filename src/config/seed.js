const bcrypt = require("bcrypt");
const { pool } = require("./database");

async function seed() {
  let connection;

  try {
    connection = await pool.getConnection();

    // Seed roles
    const roles = [
      { name: "admin", description: "System administrator - full access" },
      {
        name: "vehicle_manager",
        description: "Manages vehicles, approves requests, generates reports",
      },
      {
        name: "scheduler",
        description: "Prepares vehicle schedules, searches vehicles",
      },
      {
        name: "driver",
        description: "Requests exit permission and maintenance",
      },
      { name: "mechanic", description: "Views maintenance requests" },
      { name: "user", description: "Views scheduled vehicles" },
      {
        name: "security_guard",
        description: "Views approved exit permissions only",
      },
    ];

    console.log("Seeding roles...");
    for (const role of roles) {
      await connection.query(
        "INSERT IGNORE INTO roles (name, description) VALUES (?, ?)",
        [role.name, role.description],
      );
    }
    console.log("✓ Roles seeded successfully");

    // Create default admin user
    const hashedPassword = await bcrypt.hash("Admin@123", 10);
    const [adminRole] = await connection.query(
      "SELECT id FROM roles WHERE name = ?",
      ["admin"],
    );

    await connection.query(
      `INSERT IGNORE INTO users (first_name, last_name, email, password, phone, role_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        "System",
        "Administrator",
        "admin@haramaya.edu.et",
        hashedPassword,
        "+251911000000",
        adminRole[0].id,
      ],
    );

    console.log("\n✓ Default admin user created");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  Email:    admin@haramaya.edu.et");
    console.log("  Password: Admin@123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(
      "  ⚠  IMPORTANT: Change this password immediately after first login!\n",
    );

    console.log("✓ Database seeding completed successfully");
  } catch (error) {
    console.error("✗ Seeding failed:", error.message);
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
    }
    process.exit(0);
  }
}

seed();
