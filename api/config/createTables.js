// Create all database tables
const createTables = async (connection) => {
  try {
    // Roles Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) UNIQUE NOT NULL,
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Users Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role_id INT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        password_changed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
        INDEX idx_users_email (email),
        INDEX idx_users_username (username),
        INDEX idx_users_role (role_id)
      )
    `);

    // Vehicles Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        plate_number VARCHAR(20) UNIQUE NOT NULL,
        make VARCHAR(100) NOT NULL,
        model VARCHAR(100) NOT NULL,
        year INT NOT NULL,
        color VARCHAR(50),
        vin VARCHAR(50) UNIQUE,
        capacity INT,
        type VARCHAR(50),
        fuel_type ENUM('petrol', 'diesel', 'electric', 'hybrid') NOT NULL,
        status ENUM('available', 'in_use', 'maintenance', 'out_of_service') DEFAULT 'available',
        mileage DECIMAL(10, 2) DEFAULT 0,
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_vehicles_plate (plate_number),
        INDEX idx_vehicles_status (status)
      )
    `);

    // Fuel Records Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS fuel_records (
        id INT PRIMARY KEY AUTO_INCREMENT,
        vehicle_id INT NOT NULL,
        driver_id INT NOT NULL,
        fuel_amount DECIMAL(10, 2) NOT NULL,
        cost DECIMAL(10, 2) NOT NULL,
        odometer_reading DECIMAL(10, 2) NOT NULL,
        fuel_station VARCHAR(255),
        receipt_number VARCHAR(100),
        fueled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
        FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE RESTRICT,
        INDEX idx_fuel_vehicle (vehicle_id)
      )
    `);

    // Maintenance Requests Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS maintenance_requests (
        id INT PRIMARY KEY AUTO_INCREMENT,
        vehicle_id INT NOT NULL,
        requested_by INT NOT NULL,
        assigned_to INT,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
        estimated_cost DECIMAL(10, 2),
        actual_cost DECIMAL(10, 2),
        scheduled_date DATE,
        completed_at TIMESTAMP NULL,
        notes TEXT,
        requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
        FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE RESTRICT,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_maintenance_vehicle (vehicle_id),
        INDEX idx_maintenance_status (status)
      )
    `);

    // Schedules Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS schedules (
        id INT PRIMARY KEY AUTO_INCREMENT,
        vehicle_id INT NOT NULL,
        driver_id INT NOT NULL,
        created_by INT NOT NULL,
        purpose VARCHAR(255) NOT NULL,
        destination VARCHAR(255) NOT NULL,
        start_date DATETIME NOT NULL,
        end_date DATETIME NOT NULL,
        status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
        passengers INT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
        FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE RESTRICT,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
        INDEX idx_schedules_vehicle (vehicle_id),
        INDEX idx_schedules_driver (driver_id)
      )
    `);

    // Exit Requests Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS exit_requests (
        id INT PRIMARY KEY AUTO_INCREMENT,
        vehicle_id INT NOT NULL,
        driver_id INT NOT NULL,
        schedule_id INT,
        destination VARCHAR(255) NOT NULL,
        purpose VARCHAR(255) NOT NULL,
        expected_return DATETIME NOT NULL,
        status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
        approved_by INT,
        approved_at TIMESTAMP NULL,
        rejected_by INT,
        rejection_reason TEXT,
        actual_return DATETIME,
        notes TEXT,
        requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
        FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE RESTRICT,
        FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE SET NULL,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (rejected_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_exit_requests_status (status)
      )
    `);

    console.log("✓ All tables created successfully");
  } catch (error) {
    console.error("✗ Error creating tables:", error.message);
    throw error;
  }
};

module.exports = { createTables };
