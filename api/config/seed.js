const bcrypt = require("bcrypt");
const { pool } = require("./database");

async function seed() {
  let connection;

  try {
    connection = await pool.getConnection();

    // Seed roles
    const roles = [
      {
        name: "system_admin",
        description: "System administrator - full access",
      },
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

    // Create default users for each role
    console.log("\nSeeding default users...");

    const defaultUsers = [
      {
        firstName: "System",
        lastName: "Administrator",
        username: "admin",
        email: "admin@haramaya.edu.et",
        password: "Admin@123",
        phone: "+251911000000",
        role: "system_admin",
      },
      {
        firstName: "Vehicle",
        lastName: "Manager",
        username: "manager",
        email: "manager@haramaya.edu.et",
        password: "Manager@123",
        phone: "+251911000001",
        role: "vehicle_manager",
      },
      {
        firstName: "John",
        lastName: "Driver",
        username: "driver",
        email: "driver@haramaya.edu.et",
        password: "Driver@123",
        phone: "+251911000002",
        role: "driver",
      },
      {
        firstName: "Security",
        lastName: "Guard",
        username: "guard",
        email: "guard@haramaya.edu.et",
        password: "Guard@123",
        phone: "+251911000003",
        role: "security_guard",
      },
      {
        firstName: "Mike",
        lastName: "Mechanic",
        username: "mechanic",
        email: "mechanic@haramaya.edu.et",
        password: "Mechanic@123",
        phone: "+251911000004",
        role: "mechanic",
      },
      {
        firstName: "Schedule",
        lastName: "Manager",
        username: "scheduler",
        email: "scheduler@haramaya.edu.et",
        password: "Scheduler@123",
        phone: "+251911000005",
        role: "scheduler",
      },
    ];

    for (const user of defaultUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const [roleResult] = await connection.query(
        "SELECT id FROM roles WHERE name = ?",
        [user.role],
      );

      if (roleResult.length > 0) {
        await connection.query(
          `INSERT IGNORE INTO users (first_name, last_name, username, email, password, phone, role_id) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            user.firstName,
            user.lastName,
            user.username,
            user.email,
            hashedPassword,
            user.phone,
            roleResult[0].id,
          ],
        );
        console.log(`✓ Created user: ${user.email}`);
      }
    }

    console.log("\n✓ Default users created");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  DEFAULT LOGIN CREDENTIALS:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  System Admin:");
    console.log("    Email:    admin@haramaya.edu.et");
    console.log("    Password: Admin@123");
    console.log("");
    console.log("  Vehicle Manager:");
    console.log("    Email:    manager@haramaya.edu.et");
    console.log("    Password: Manager@123");
    console.log("");
    console.log("  Driver:");
    console.log("    Email:    driver@haramaya.edu.et");
    console.log("    Password: Driver@123");
    console.log("");
    console.log("  Security Guard:");
    console.log("    Email:    guard@haramaya.edu.et");
    console.log("    Password: Guard@123");
    console.log("");
    console.log("  Mechanic:");
    console.log("    Email:    mechanic@haramaya.edu.et");
    console.log("    Password: Mechanic@123");
    console.log("");
    console.log("  Scheduler:");
    console.log("    Email:    scheduler@haramaya.edu.et");
    console.log("    Password: Scheduler@123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  ⚠  IMPORTANT: Change these passwords after first login!\n");

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
