const { pool } = require("../config/database");

class UserNotification {
  static async create(userNotificationData) {
    const {
      notification_id,
      user_id,
      channel,
      status = "pending",
    } = userNotificationData;

    const [result] = await pool.query(
      `INSERT INTO user_notifications (notification_id, user_id, channel, status) 
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE status = VALUES(status)`,
      [notification_id, user_id, channel, status],
    );

    return result.insertId;
  }

  static async findByUserId(userId, limit, offset, unreadOnly = false) {
    let query = `
      SELECT un.*, n.title, n.message, n.priority, n.metadata, n.created_at as notification_created_at,
             nt.name as type_name, nt.description as type_description
      FROM user_notifications un
      JOIN notifications n ON un.notification_id = n.id
      JOIN notification_types nt ON n.type_id = nt.id
      WHERE un.user_id = ? AND un.channel = 'web'
    `;
    const params = [userId];

    if (unreadOnly) {
      query += " AND un.status NOT IN ('read')";
    }

    query += " ORDER BY n.priority DESC, n.created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async markAsRead(id, userId) {
    await pool.query(
      `UPDATE user_notifications 
       SET status = 'read', read_at = NOW() 
       WHERE id = ? AND user_id = ?`,
      [id, userId],
    );
  }

  static async markAllAsRead(userId) {
    await pool.query(
      `UPDATE user_notifications 
       SET status = 'read', read_at = NOW() 
       WHERE user_id = ? AND status != 'read' AND channel = 'web'`,
      [userId],
    );
  }

  static async updateStatus(id, status, errorMessage = null) {
    const fields = ["status = ?"];
    const params = [status];

    if (status === "sent" || status === "delivered") {
      fields.push("sent_at = NOW()");
    }

    if (errorMessage) {
      fields.push("error_message = ?");
      params.push(errorMessage);
    }

    params.push(id);

    await pool.query(
      `UPDATE user_notifications SET ${fields.join(", ")} WHERE id = ?`,
      params,
    );
  }

  static async getUnreadCount(userId) {
    const [rows] = await pool.query(
      `SELECT COUNT(*) as count 
       FROM user_notifications 
       WHERE user_id = ? AND status NOT IN ('read') AND channel = 'web'`,
      [userId],
    );
    return rows[0].count;
  }

  static async findPendingByChannel(channel, notificationId = null, limit = 100) {
    let query = `
      SELECT un.*, n.title, n.message, n.priority, n.metadata, n.created_at as notification_created_at,
              u.email, u.phone, u.first_name, u.last_name,
              nt.name as type_name
       FROM user_notifications un
       JOIN notifications n ON un.notification_id = n.id
       JOIN users u ON un.user_id = u.id
       JOIN notification_types nt ON n.type_id = nt.id
       WHERE un.channel = ? AND un.status = 'pending'
    `;
    const params = [channel];

    if (notificationId) {
      query += " AND un.notification_id = ?";
      params.push(notificationId);
    }

    query += " ORDER BY n.priority DESC, n.created_at ASC LIMIT ?";
    params.push(limit);

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async delete(id) {
    await pool.query("DELETE FROM user_notifications WHERE id = ?", [id]);
  }
}

module.exports = UserNotification;
