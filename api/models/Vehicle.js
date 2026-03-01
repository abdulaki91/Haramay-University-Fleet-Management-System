const { pool } = require("../config/database");

class Vehicle {
  static async create(vehicleData) {
    const {
      plate_number,
      make,
      model,
      year,
      color,
      vin,
      capacity,
      fuel_type,
      status,
      mileage,
    } = vehicleData;

    const [result] = await pool.query(
      `INSERT INTO vehicles (plate_number, make, model, year, color, vin, capacity, fuel_type, status, mileage) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        plate_number,
        make,
        model,
        year,
        color,
        vin,
        capacity,
        fuel_type,
        status || "available",
        mileage || 0,
      ],
    );

    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.query("SELECT * FROM vehicles WHERE id = ?", [
      id,
    ]);
    return rows[0];
  }

  static async findByPlateNumber(plateNumber) {
    const [rows] = await pool.query(
      "SELECT * FROM vehicles WHERE plate_number LIKE ?",
      [`%${plateNumber}%`],
    );
    return rows;
  }

  static async findAll(limit, offset, status = null) {
    let query = "SELECT * FROM vehicles";
    const params = [];

    if (status) {
      query += " WHERE status = ?";
      params.push(status);
    }

    query += " ORDER BY registered_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async count(status = null) {
    let query = "SELECT COUNT(*) as total FROM vehicles";
    const params = [];

    if (status) {
      query += " WHERE status = ?";
      params.push(status);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].total;
  }

  static async update(id, vehicleData) {
    const fields = [];
    const values = [];

    Object.keys(vehicleData).forEach((key) => {
      if (vehicleData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(vehicleData[key]);
      }
    });

    if (fields.length === 0) return false;

    values.push(id);
    await pool.query(
      `UPDATE vehicles SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );
    return true;
  }

  static async updateStatus(id, status) {
    await pool.query("UPDATE vehicles SET status = ? WHERE id = ?", [
      status,
      id,
    ]);
  }

  static async delete(id) {
    await pool.query("DELETE FROM vehicles WHERE id = ?", [id]);
  }
}

module.exports = Vehicle;
