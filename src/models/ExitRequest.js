const { pool } = require("../config/database");

class ExitRequest {
  static async create(exitData) {
    const {
      vehicle_id,
      driver_id,
      schedule_id,
      destination,
      purpose,
      expected_return,
      notes,
    } = exitData;

    const [result] = await pool.query(
      `INSERT INTO exit_requests (vehicle_id, driver_id, schedule_id, destination, purpose, expected_return, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        vehicle_id,
        driver_id,
        schedule_id,
        destination,
        purpose,
        expected_return,
        notes,
      ],
    );

    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT er.*, v.plate_number, v.make, v.model,
              CONCAT(u1.first_name, ' ', u1.last_name) as driver_name,
              CONCAT(u2.first_name, ' ', u2.last_name) as approved_by_name
       FROM exit_requests er
       JOIN vehicles v ON er.vehicle_id = v.id
       JOIN users u1 ON er.driver_id = u1.id
       LEFT JOIN users u2 ON er.approved_by = u2.id
       WHERE er.id = ?`,
      [id],
    );
    return rows[0];
  }

  static async findAll(limit, offset, status = null) {
    let query = `
      SELECT er.*, v.plate_number, v.make, v.model,
             CONCAT(u1.first_name, ' ', u1.last_name) as driver_name,
             CONCAT(u2.first_name, ' ', u2.last_name) as approved_by_name
      FROM exit_requests er
      JOIN vehicles v ON er.vehicle_id = v.id
      JOIN users u1 ON er.driver_id = u1.id
      LEFT JOIN users u2 ON er.approved_by = u2.id
    `;
    const params = [];

    if (status) {
      query += " WHERE er.status = ?";
      params.push(status);
    }

    query += " ORDER BY er.created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async findApproved(limit, offset) {
    const [rows] = await pool.query(
      `SELECT er.*, v.plate_number, v.make, v.model,
              CONCAT(u1.first_name, ' ', u1.last_name) as driver_name,
              CONCAT(u2.first_name, ' ', u2.last_name) as approved_by_name
       FROM exit_requests er
       JOIN vehicles v ON er.vehicle_id = v.id
       JOIN users u1 ON er.driver_id = u1.id
       LEFT JOIN users u2 ON er.approved_by = u2.id
       WHERE er.status = 'approved'
       ORDER BY er.approval_date DESC
       LIMIT ? OFFSET ?`,
      [limit, offset],
    );
    return rows;
  }

  static async count(status = null) {
    let query = "SELECT COUNT(*) as total FROM exit_requests";
    const params = [];

    if (status) {
      query += " WHERE status = ?";
      params.push(status);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].total;
  }

  static async approve(id, approvedBy) {
    await pool.query(
      `UPDATE exit_requests 
       SET status = 'approved', approved_by = ?, approval_date = NOW() 
       WHERE id = ?`,
      [approvedBy, id],
    );
  }

  static async reject(id, approvedBy, reason) {
    await pool.query(
      `UPDATE exit_requests 
       SET status = 'rejected', approved_by = ?, rejection_reason = ?, approval_date = NOW() 
       WHERE id = ?`,
      [approvedBy, reason, id],
    );
  }

  static async complete(id, actualReturn) {
    await pool.query(
      `UPDATE exit_requests 
       SET status = 'completed', actual_return = ? 
       WHERE id = ?`,
      [actualReturn, id],
    );
  }
}

module.exports = ExitRequest;
