const { pool } = require("../config/database");

class NotificationPreference {
  static async create(preferenceData) {
    const {
      user_id,
      notification_type_id,
      channels,
      enabled = true,
    } = preferenceData;

    const [result] = await pool.query(
      `INSERT INTO notification_preferences (user_id, notification_type_id, channels, enabled) 
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       channels = VALUES(channels), 
       enabled = VALUES(enabled),
       updated_at = NOW()`,
      [user_id, notification_type_id, JSON.stringify(channels), enabled],
    );

    return result.insertId;
  }

  static async findByUserId(userId) {
    const [rows] = await pool.query(
      `SELECT np.*, nt.name as type_name, nt.description as type_description, nt.default_channels
       FROM notification_preferences np
       JOIN notification_types nt ON np.notification_type_id = nt.id
       WHERE np.user_id = ?
       ORDER BY nt.name`,
      [userId],
    );
    return rows;
  }

  static async findByUserAndType(userId, typeId) {
    const [rows] = await pool.query(
      `SELECT np.*, nt.name as type_name, nt.default_channels
       FROM notification_preferences np
       JOIN notification_types nt ON np.notification_type_id = nt.id
       WHERE np.user_id = ? AND np.notification_type_id = ?`,
      [userId, typeId],
    );
    return rows[0];
  }

  static async getEffectiveChannels(userId, typeId) {
    // Get user preference or fall back to default
    const preference = await this.findByUserAndType(userId, typeId);

    if (preference && preference.enabled) {
      return JSON.parse(preference.channels);
    }

    // Get default channels from notification type
    const [rows] = await pool.query(
      "SELECT default_channels FROM notification_types WHERE id = ?",
      [typeId],
    );

    if (rows[0]) {
      return JSON.parse(rows[0].default_channels);
    }

    return ["web"]; // Fallback to web only
  }

  static async update(userId, typeId, preferenceData) {
    const { channels, enabled } = preferenceData;

    await pool.query(
      `UPDATE notification_preferences 
       SET channels = ?, enabled = ?, updated_at = NOW()
       WHERE user_id = ? AND notification_type_id = ?`,
      [JSON.stringify(channels), enabled, userId, typeId],
    );
  }

  static async delete(userId, typeId) {
    await pool.query(
      "DELETE FROM notification_preferences WHERE user_id = ? AND notification_type_id = ?",
      [userId, typeId],
    );
  }

  static async initializeDefaultsForUser(userId) {
    // Create default preferences for all notification types
    await pool.query(
      `INSERT INTO notification_preferences (user_id, notification_type_id, channels, enabled)
       SELECT ?, id, default_channels, true
       FROM notification_types
       ON DUPLICATE KEY UPDATE user_id = user_id`, // Do nothing if already exists
      [userId],
    );
  }
}

module.exports = NotificationPreference;
