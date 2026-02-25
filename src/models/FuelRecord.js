const { pool } = require("../config/database");

class FuelRecord {
  static async create(fuelData) {
    const {
      vehicle_id,
      driver_id,
      fuel_amount,
      cost,
      odometer_reading,
      fuel_station,
      receipt_number,
      notes,
    } = fuelData;

    const [result] = await pool.query(
      `INSERT INTO fuel_records (vehicle_id, driver_id, fuel_amount, cost, odometer_reading, fuel_station, receipt_number, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        vehicle_id,
        driver_id,
        fuel_amount,
        cost,
        odometer_reading,
        fuel_station,
        receipt_number,
        notes,
      ],
    );

    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT fr.*, v.plate_number, v.make, v.model,
              CONCAT(u.first_name, ' ', u.last_name) as driver_name
       FROM fuel_records fr
       JOIN vehicles v ON fr.vehicle_id = v.id
       JOIN users u ON fr.driver_id = u.id
       WHERE fr.id = ?`,
      [id],
    );
    return rows[0];
  }

  static async findByVehicle(vehicleId, limit, offset) {
    const [rows] = await pool.query(
      `SELECT fr.*, CONCAT(u.first_name, ' ', u.last_name) as driver_name
       FROM fuel_records fr
       JOIN users u ON fr.driver_id = u.id
       WHERE fr.vehicle_id = ?
       ORDER BY fr.filled_at DESC
       LIMIT ? OFFSET ?`,
      [vehicleId, limit, offset],
    );
    return rows;
  }

  static async findAll(limit, offset) {
    const [rows] = await pool.query(
      `SELECT fr.*, v.plate_number, v.make, v.model,
              CONCAT(u.first_name, ' ', u.last_name) as driver_name
       FROM fuel_records fr
       JOIN vehicles v ON fr.vehicle_id = v.id
       JOIN users u ON fr.driver_id = u.id
       ORDER BY fr.filled_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset],
    );
    return rows;
  }

  static async count(vehicleId = null) {
    let query = "SELECT COUNT(*) as total FROM fuel_records";
    const params = [];

    if (vehicleId) {
      query += " WHERE vehicle_id = ?";
      params.push(vehicleId);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].total;
  }

  // Calculate fuel consumption for a vehicle
  static async calculateConsumption(vehicleId) {
    const [rows] = await pool.query(
      `SELECT 
        SUM(fuel_amount) as total_fuel,
        SUM(cost) as total_cost,
        MAX(odometer_reading) - MIN(odometer_reading) as distance_covered,
        COUNT(*) as refuel_count
       FROM fuel_records
       WHERE vehicle_id = ?`,
      [vehicleId],
    );

    const data = rows[0];
    const consumption =
      data.distance_covered > 0
        ? ((data.total_fuel / data.distance_covered) * 100).toFixed(2)
        : 0;

    return {
      total_fuel: parseFloat(data.total_fuel || 0),
      total_cost: parseFloat(data.total_cost || 0),
      distance_covered: parseFloat(data.distance_covered || 0),
      refuel_count: data.refuel_count,
      average_consumption: parseFloat(consumption),
      unit: "L/100km",
    };
  }

  // Calculate fuel balance (total fuel added)
  static async calculateBalance(vehicleId) {
    const [rows] = await pool.query(
      `SELECT SUM(fuel_amount) as total_fuel, SUM(cost) as total_cost
       FROM fuel_records
       WHERE vehicle_id = ?`,
      [vehicleId],
    );

    return {
      total_fuel: parseFloat(rows[0].total_fuel || 0),
      total_cost: parseFloat(rows[0].total_cost || 0),
    };
  }
}

module.exports = FuelRecord;
