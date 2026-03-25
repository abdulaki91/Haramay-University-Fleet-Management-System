# Email Notification Setup Guide

## Overview

The Fleet Management System now supports email notifications using Gmail SMTP. This guide will help you configure email notifications for your system.

## Prerequisites

1. **Gmail Account**: You need a Gmail account to send emails
2. **App Password**: Gmail requires an App Password for third-party applications
3. **2-Factor Authentication**: Must be enabled on your Gmail account to create App Passwords

## Step 1: Enable 2-Factor Authentication

1. Go to your [Google Account settings](https://myaccount.google.com/)
2. Navigate to **Security** → **2-Step Verification**
3. Follow the setup process to enable 2FA

## Step 2: Generate App Password

1. Go to [Google Account settings](https://myaccount.google.com/)
2. Navigate to **Security** → **App passwords**
3. Select **Mail** as the app and **Other** as the device
4. Enter "Fleet Management System" as the device name
5. Copy the generated 16-character password

## Step 3: Configure Environment Variables

Update your `.env` file with the following email configuration:

```env
# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_FROM_NAME=Haramaya Fleet Management
EMAIL_FROM_ADDRESS=your-email@gmail.com
```

### Configuration Options

- **EMAIL_HOST**: SMTP server (Gmail: `smtp.gmail.com`)
- **EMAIL_PORT**: SMTP port (Gmail: `587` for TLS)
- **EMAIL_SECURE**: Use SSL (false for TLS, true for SSL)
- **EMAIL_USER**: Your Gmail address
- **EMAIL_PASS**: The App Password (NOT your regular Gmail password)
- **EMAIL_FROM_NAME**: Display name for sent emails
- **EMAIL_FROM_ADDRESS**: From email address (usually same as EMAIL_USER)

## Step 4: Test Email Configuration

### Using the API (Admin only)

1. **Check Email Status**:

   ```bash
   curl -X GET http://localhost:3000/api/notifications/admin/email-status \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
   ```

2. **Send Test Email**:
   ```bash
   curl -X POST http://localhost:3000/api/notifications/admin/test-email \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com"}'
   ```

### Using the Frontend (Admin only)

1. Login as a system administrator
2. Click on the notification bell in the header
3. Use the development buttons:
   - **Email Status**: Check if email service is configured and connected
   - **Test Email**: Send a test email to your account
   - **Test Notif**: Create a test notification (will send both web and email)

## Step 5: Verify Email Notifications

### Automatic Email Triggers

Emails are automatically sent for:

- **Maintenance Due**: Vehicle maintenance alerts
- **Low Fuel**: Fuel level warnings
- **Schedule Assignment**: New schedule notifications
- **Exit Request Status**: Approval/rejection notifications
- **System Alerts**: Important system notifications

### User Preferences

Users can control email notifications through:

1. **Notification Settings** page in the frontend
2. Enable/disable email notifications per notification type
3. Choose preferred channels (web, email, SMS)

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify App Password is correct (16 characters, no spaces)
   - Ensure 2FA is enabled on Gmail account
   - Check EMAIL_USER matches the Gmail account

2. **Connection Timeout**
   - Verify EMAIL_HOST and EMAIL_PORT are correct
   - Check firewall settings
   - Ensure internet connectivity

3. **Emails Not Sending**
   - Check server logs for error messages
   - Verify user email addresses in database
   - Test with "Test Email" button first

4. **Emails Going to Spam**
   - Add your domain to SPF records
   - Consider using a dedicated email service for production
   - Ask recipients to whitelist your email address

### Debug Commands

```bash
# Check email service status
npm run email-status

# Send test email
npm run test-email your-email@example.com

# View email logs
tail -f logs/email.log
```

## Security Best Practices

### Production Recommendations

1. **Use Environment Variables**: Never commit email credentials to code
2. **Dedicated Email Account**: Create a separate Gmail account for the system
3. **Monitor Usage**: Keep track of email sending limits
4. **Backup Configuration**: Document your email setup

### Gmail Limits

- **Daily Limit**: 500 emails per day for regular Gmail accounts
- **Rate Limit**: 100 emails per hour
- **Recipient Limit**: 500 recipients per email

For higher volumes, consider:

- Google Workspace (higher limits)
- Dedicated email services (SendGrid, Mailgun, etc.)

## Alternative Email Providers

### SendGrid Configuration

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

### Mailgun Configuration

```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-mailgun-username
EMAIL_PASS=your-mailgun-password
```

### Office 365 Configuration

```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-office365-email
EMAIL_PASS=your-office365-password
```

## Email Templates

### Customizing Email Templates

The email templates are defined in `api/services/emailService.js`. You can customize:

- **HTML Layout**: Modify the HTML template
- **Styling**: Update CSS styles
- **Content**: Change email text and structure
- **Branding**: Add logos and company information

### Template Variables

Available variables in email templates:

- `notification.title`: Notification title
- `notification.message`: Notification message
- `notification.priority`: Priority level
- `notification.type`: Notification type
- `notification.createdAt`: Creation timestamp

## Monitoring and Analytics

### Email Delivery Tracking

The system tracks:

- **Sent Status**: Successfully sent emails
- **Failed Status**: Failed email attempts
- **Error Messages**: Detailed error information
- **Delivery Time**: Email sending timestamps

### Database Queries

```sql
-- Check email notification status
SELECT * FROM user_notifications WHERE channel = 'email';

-- Count email notifications by status
SELECT status, COUNT(*) FROM user_notifications
WHERE channel = 'email' GROUP BY status;

-- Recent email failures
SELECT * FROM user_notifications
WHERE channel = 'email' AND status = 'failed'
ORDER BY created_at DESC LIMIT 10;
```

## Support

For additional help:

1. Check server logs for detailed error messages
2. Verify Gmail account settings and App Password
3. Test with a simple email first
4. Contact system administrator for configuration assistance

---

**Note**: This email system is designed for moderate usage. For high-volume production environments, consider using dedicated email services like SendGrid, Mailgun, or Amazon SES.
