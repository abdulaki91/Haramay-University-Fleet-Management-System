const { pool } = require("../config/database");

class MaintenanceRequest {
  static async create(maintenanceData) {
    const { vehicle_id, requested_by, title, description, priority, notes } =
      maintenanceData;

    const [result] = await pool.query(
      `INSERT INTO maintenance_requests (vehicle_id, requested_by, title, description, priority, notes) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        vehicle_id,
        requested_by,
        title,
        description,
        priority || "medium",
        notes,
      ],
    );

    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT mr.*, v.plate_number, v.make, v.model,
              CONCAT(u1.first_name, ' ', u1.last_name) as requested_by_name,
              CONCAT(u2.first_name, ' ', u2.last_name) as assigned_to_name
       FROM maintenance_requests mr
       JOIN vehicles v ON mr.vehicle_id = v.id
       JOIN users u1 ON mr.requested_by = u1.id
       LEFT JOIN users u2 ON mr.assigned_to = u2.id
       WHERE mr.id = ?`,
      [id],
    );
    return rows[0];
  }

  static async findAll(limit, offset, status = null) {
    let query = `
      SELECT mr.*, v.plate_number, v.make, v.model,
             CONCAT(u1.first_name, ' ', u1.last_name) as requested_by_name,
             CONCAT(u2.first_name, ' ', u2.last_name) as assigned_to_name
      FROM maintenance_requests mr
      JOIN vehicles v ON mr.vehicle_id = v.id
      JOIN users u1 ON mr.requested_by = u1.id
      LEFT JOIN users u2 ON mr.assigned_to = u2.id
    `;
    const params = [];

    if (status) {
      query += " WHERE mr.status = ?";
      params.push(status);
    }

    query += " ORDER BY mr.created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async count(status = null) {
    let query = "SELECT COUNT(*) as total FROM maintenance_requests";
    const params = [];

    if (status) {
      query += " WHERE status = ?";
      params.push(status);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].total;
  }

  static async updateStatus(id, status, assignedTo = null, notes = null) {
    const updates = ["status = ?"];
    const values = [status];

    if (assignedTo) {
      updates.push("assigned_to = ?");
      values.push(assignedTo);
    }

    if (notes) {
      updates.push("notes = ?");
      values.push(notes);
    }

    if (status === "completed") {
      updates.push("completed_at = NOW()");
    }

    values.push(id);

    await pool.query(
      `UPDATE maintenance_requests SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );
  }

  static async update(id, maintenanceData) {
    const fields = [];
    const values = [];

    Object.keys(maintenanceData).forEach((key) => {
      if (maintenanceData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(maintenanceData[key]);
      }
    });

    if (fields.length === 0) return false;

    values.push(id);
    await pool.query(
      `UPDATE maintenance_requests SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );
    return true;
  }
}

module.exports = MaintenanceRequest;
