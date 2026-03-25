-- Create notifications tables for Fleet Management System

-- Notification Types Table
CREATE TABLE IF NOT EXISTS notification_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(255),
  default_channels JSON, -- ['email', 'web', 'sms']
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  type_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  target_roles JSON, -- ['driver', 'vehicle_manager', 'scheduler']
  target_users JSON, -- [1, 2, 3] specific user IDs
  metadata JSON, -- Additional data like vehicle_id, schedule_id, etc.
  channels JSON, -- ['email', 'web'] - which channels to use
  scheduled_at TIMESTAMP NULL, -- For scheduled notifications
  expires_at TIMESTAMP NULL, -- When notification expires
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (type_id) REFERENCES notification_types(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_notifications_type (type_id),
  INDEX idx_notifications_scheduled (scheduled_at),
  INDEX idx_notifications_priority (priority)
);

-- User Notifications (delivery tracking)
CREATE TABLE IF NOT EXISTS user_notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  notification_id INT NOT NULL,
  user_id INT NOT NULL,
  channel ENUM('web', 'email', 'sms') NOT NULL,
  status ENUM('pending', 'sent', 'delivered', 'read', 'failed') DEFAULT 'pending',
  sent_at TIMESTAMP NULL,
  read_at TIMESTAMP NULL,
  error_message TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_notifications_user (user_id),
  INDEX idx_user_notifications_status (status),
  INDEX idx_user_notifications_notification (notification_id),
  UNIQUE KEY unique_user_notification_channel (notification_id, user_id, channel)
);

-- Notification Preferences (user settings)
CREATE TABLE IF NOT EXISTS notification_preferences (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  notification_type_id INT NOT NULL,
  channels JSON, -- ['email', 'web'] - user's preferred channels
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (notification_type_id) REFERENCES notification_types(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_type_preference (user_id, notification_type_id)
);

-- Insert default notification types
INSERT IGNORE INTO notification_types (name, description, default_channels) VALUES
('maintenance_due', 'Vehicle maintenance is due or overdue', '["web", "email"]'),
('fuel_low', 'Vehicle fuel level is low and needs refill', '["web", "email"]'),
('schedule_assigned', 'New schedule has been assigned to driver', '["web", "email"]'),
('schedule_updated', 'Existing schedule has been modified', '["web", "email"]'),
('schedule_cancelled', 'Schedule has been cancelled', '["web", "email"]'),
('exit_request_approved', 'Exit request has been approved', '["web", "email"]'),
('exit_request_rejected', 'Exit request has been rejected', '["web", "email"]'),
('maintenance_completed', 'Vehicle maintenance has been completed', '["web", "email"]'),
('vehicle_status_changed', 'Vehicle status has been updated', '["web", "email"]'),
('system_alert', 'Important system-wide notifications', '["web", "email"]');