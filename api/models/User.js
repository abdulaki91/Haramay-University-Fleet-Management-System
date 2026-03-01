const { pool } = require("../config/database");
const bcrypt = require("bcrypt");

class User {
  static async create(userData) {
    const { first_name, last_name, email, username, password, phone, role_id } =
      userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users (first_name, last_name, email, username, password, phone, role_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, username, hashedPassword, phone, role_id],
    );

    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.username, u.email, u.phone, u.is_active,
              u.created_at, u.updated_at, r.id as role_id, r.name as role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [id],
    );
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await pool.query(
      `SELECT u.*, r.name as role_name 
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = ?`,
      [email],
    );
    return rows[0];
  }

  static async findAll(limit, offset) {
    const [rows] = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.username, u.email, u.phone, u.is_active,
              u.created_at, r.name as role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset],
    );
    return rows;
  }

  static async count() {
    const [rows] = await pool.query("SELECT COUNT(*) as total FROM users");
    return rows[0].total;
  }

  static async update(id, userData) {
    const fields = [];
    const values = [];

    Object.keys(userData).forEach((key) => {
      if (userData[key] !== undefined && key !== "password") {
        fields.push(`${key} = ?`);
        values.push(userData[key]);
      }
    });

    if (fields.length === 0) return false;

    values.push(id);
    await pool.query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );
    return true;
  }

  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      id,
    ]);
  }

  static async delete(id) {
    await pool.query("DELETE FROM users WHERE id = ?", [id]);
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;
