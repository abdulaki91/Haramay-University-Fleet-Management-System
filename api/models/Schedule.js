const { pool } = require("../config/database");

class Schedule {
  static async create(scheduleData) {
    const {
      vehicle_id,
      driver_id,
      created_by,
      purpose,
      destination,
      start_date,
      end_date,
      passengers,
      notes,
    } = scheduleData;

    const [result] = await pool.query(
      `INSERT INTO schedules (vehicle_id, driver_id, created_by, purpose, destination, start_date, end_date, passengers, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        vehicle_id,
        driver_id,
        created_by,
        purpose,
        destination,
        start_date,
        end_date,
        passengers,
        notes,
      ],
    );

    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT s.*, v.plate_number, v.make, v.model,
              CONCAT(u1.first_name, ' ', u1.last_name) as driver_name,
              CONCAT(u2.first_name, ' ', u2.last_name) as created_by_name
       FROM schedules s
       JOIN vehicles v ON s.vehicle_id = v.id
       JOIN users u1 ON s.driver_id = u1.id
       JOIN users u2 ON s.created_by = u2.id
       WHERE s.id = ?`,
      [id],
    );
    return rows[0];
  }

  static async findAll(limit, offset, status = null) {
    let query = `
      SELECT s.*, v.plate_number, v.make, v.model,
             CONCAT(u1.first_name, ' ', u1.last_name) as driver_name,
             CONCAT(u2.first_name, ' ', u2.last_name) as created_by_name
      FROM schedules s
      JOIN vehicles v ON s.vehicle_id = v.id
      JOIN users u1 ON s.driver_id = u1.id
      JOIN users u2 ON s.created_by = u2.id
    `;
    const params = [];

    if (status) {
      query += " WHERE s.status = ?";
      params.push(status);
    }

    query += " ORDER BY s.start_date DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async count(status = null) {
    let query = "SELECT COUNT(*) as total FROM schedules";
    const params = [];

    if (status) {
      query += " WHERE status = ?";
      params.push(status);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].total;
  }

  static async update(id, scheduleData) {
    const fields = [];
    const values = [];

    Object.keys(scheduleData).forEach((key) => {
      if (scheduleData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(scheduleData[key]);
      }
    });

    if (fields.length === 0) return false;

    values.push(id);
    await pool.query(
      `UPDATE schedules SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );
    return true;
  }

  static async updateStatus(id, status) {
    await pool.query("UPDATE schedules SET status = ? WHERE id = ?", [
      status,
      id,
    ]);
  }

  static async delete(id) {
    await pool.query("DELETE FROM schedules WHERE id = ?", [id]);
  }
}

module.exports = Schedule;
