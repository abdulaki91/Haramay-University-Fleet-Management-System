const { pool } = require("../config/database");

class Notification {
  static async create(notificationData) {
    const {
      type_id,
      title,
      message,
      priority = "medium",
      target_roles,
      target_users,
      metadata,
      channels,
      scheduled_at,
      expires_at,
      created_by,
    } = notificationData;

    const [result] = await pool.query(
      `INSERT INTO notifications 
       (type_id, title, message, priority, target_roles, target_users, metadata, channels, scheduled_at, expires_at, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        type_id,
        title,
        message,
        priority,
        JSON.stringify(target_roles),
        JSON.stringify(target_users),
        JSON.stringify(metadata),
        JSON.stringify(channels),
        scheduled_at,
        expires_at,
        created_by,
      ],
    );

    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT n.*, nt.name as type_name, nt.description as type_description
       FROM notifications n
       JOIN notification_types nt ON n.type_id = nt.id
       WHERE n.id = ?`,
      [id],
    );
    return rows[0];
  }

  static async findAll(limit, offset, filters = {}) {
    let query = `
      SELECT n.*, nt.name as type_name, nt.description as type_description
      FROM notifications n
      JOIN notification_types nt ON n.type_id = nt.id
    `;
    const params = [];
    const conditions = [];

    if (filters.type_id) {
      conditions.push("n.type_id = ?");
      params.push(filters.type_id);
    }

    if (filters.priority) {
      conditions.push("n.priority = ?");
      params.push(filters.priority);
    }

    if (filters.user_id) {
      conditions.push(
        "(JSON_CONTAINS(n.target_users, ?) OR JSON_CONTAINS(n.target_roles, (SELECT JSON_QUOTE(r.name) FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?)))",
      );
      params.push(JSON.stringify([filters.user_id]), filters.user_id);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY n.created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async findPendingNotifications() {
    const [rows] = await pool.query(
      `SELECT n.*, nt.name as type_name
       FROM notifications n
       JOIN notification_types nt ON n.type_id = nt.id
       WHERE (n.scheduled_at IS NULL OR n.scheduled_at <= NOW())
       AND (n.expires_at IS NULL OR n.expires_at > NOW())
       AND n.id NOT IN (
         SELECT DISTINCT notification_id 
         FROM user_notifications 
         WHERE status IN ('sent', 'delivered', 'read')
       )
       ORDER BY n.priority DESC, n.created_at ASC`,
    );
    return rows;
  }

  static async markAsProcessed(id) {
    await pool.query(
      "UPDATE notifications SET processed_at = NOW() WHERE id = ?",
      [id],
    );
  }

  static async delete(id) {
    await pool.query("DELETE FROM notifications WHERE id = ?", [id]);
  }

  static async count(filters = {}) {
    let query = "SELECT COUNT(*) as total FROM notifications n";
    const params = [];
    const conditions = [];

    if (filters.type_id) {
      conditions.push("n.type_id = ?");
      params.push(filters.type_id);
    }

    if (filters.user_id) {
      conditions.push(
        "(JSON_CONTAINS(n.target_users, ?) OR JSON_CONTAINS(n.target_roles, (SELECT JSON_QUOTE(r.name) FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?)))",
      );
      params.push(JSON.stringify([filters.user_id]), filters.user_id);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    const [rows] = await pool.query(query, params);
    return rows[0].total;
  }
}

module.exports = Notification;
