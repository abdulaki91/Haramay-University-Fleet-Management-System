const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      // Check if email configuration is provided
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn(
          "⚠️  Email configuration not found. Email notifications will be disabled.",
        );
        return;
      }

      this.transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS, // Use App Password for Gmail
        },
        tls: {
          rejectUnauthorized: false, // Allow self-signed certificates
        },
      });

      this.isConfigured = true;
      console.log("✓ Email service initialized successfully");
    } catch (error) {
      console.error("✗ Failed to initialize email service:", error.message);
      this.isConfigured = false;
    }
  }

  async verifyConnection() {
    if (!this.isConfigured || !this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      console.log("✓ Email server connection verified");
      return true;
    } catch (error) {
      console.error("✗ Email server connection failed:", error.message);
      return false;
    }
  }

  async sendEmail({ to, subject, text, html }) {
    if (!this.isConfigured || !this.transporter) {
      console.warn("Email service not configured. Skipping email send.");
      return { success: false, error: "Email service not configured" };
    }

    try {
      const mailOptions = {
        from: {
          name: process.env.EMAIL_FROM_NAME || "Haramaya Fleet Management",
          address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER,
        },
        to,
        subject,
        text,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✓ Email sent successfully to ${to}: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId,
        response: info.response,
      };
    } catch (error) {
      console.error(`✗ Failed to send email to ${to}:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async sendNotificationEmail(userEmail, notification) {
    const priorityColors = {
      low: "#3b82f6", // blue
      medium: "#f59e0b", // yellow
      high: "#f97316", // orange
      critical: "#ef4444", // red
    };

    const priorityLabels = {
      low: "Low Priority",
      medium: "Medium Priority",
      high: "High Priority",
      critical: "Critical Priority",
    };

    const color = priorityColors[notification.priority] || "#6b7280";
    const priorityLabel =
      priorityLabels[notification.priority] || "Medium Priority";

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Fleet Management Notification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #ffffff; padding: 30px 20px; border: 1px solid #e5e7eb; }
          .priority-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; color: white; background-color: ${color}; margin-bottom: 15px; }
          .notification-title { font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #1f2937; }
          .notification-message { font-size: 16px; margin-bottom: 20px; color: #4b5563; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
          .footer p { margin: 0; font-size: 14px; color: #6b7280; }
          .btn { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px; }
          .btn:hover { background: #5a67d8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚗 Haramaya Fleet Management</h1>
            <p>New Notification Alert</p>
          </div>
          <div class="content">
            <div class="priority-badge">${priorityLabel}</div>
            <div class="notification-title">${notification.title}</div>
            <div class="notification-message">${notification.message}</div>
            <p><strong>Type:</strong> ${notification.type}</p>
            <p><strong>Time:</strong> ${new Date(notification.createdAt).toLocaleString()}</p>
            <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}" class="btn">
              View in Dashboard
            </a>
          </div>
          <div class="footer">
            <p>This is an automated notification from Haramaya University Fleet Management System.</p>
            <p>Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Haramaya Fleet Management - New Notification

Priority: ${priorityLabel}
Title: ${notification.title}
Message: ${notification.message}
Type: ${notification.type}
Time: ${new Date(notification.createdAt).toLocaleString()}

View in Dashboard: ${process.env.FRONTEND_URL || "http://localhost:5173"}

This is an automated notification from Haramaya University Fleet Management System.
    `;

    return await this.sendEmail({
      to: userEmail,
      subject: `[${priorityLabel}] ${notification.title}`,
      text,
      html,
    });
  }

  // Test email functionality
  async sendTestEmail(to) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Email Test</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .container { max-width: 500px; margin: 0 auto; text-align: center; }
          .success { color: #10b981; font-size: 18px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>🎉 Email Configuration Test</h2>
          <p class="success">✓ Email service is working correctly!</p>
          <p>This is a test email from Haramaya Fleet Management System.</p>
          <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to,
      subject: "Fleet Management - Email Test",
      text: "Email service is working correctly! This is a test email from Haramaya Fleet Management System.",
      html,
    });
  }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService;
