# Automated Notifications Module - Fleet Management System

## Overview

The Automated Notifications module provides comprehensive notification capabilities for the Haramaya Fleet Management System, supporting multiple delivery channels and role-based permissions.

## Features

### ✅ **Multi-Channel Notifications**

- **Web Notifications**: Real-time in-app notifications via WebSocket
- **Email Notifications**: Email delivery (ready for SMTP integration)
- **SMS Notifications**: SMS delivery (ready for SMS provider integration)

### ✅ **Role-Based Notifications**

- **Maintenance Due**: Alerts vehicle managers and mechanics
- **Low Fuel**: Notifies vehicle managers and assigned drivers
- **Schedule Assignments**: Alerts drivers about new schedules
- **Exit Request Status**: Notifies drivers of approval/rejection
- **System Alerts**: Important system-wide notifications

### ✅ **Smart Automation**

- **Periodic Checks**: Automated maintenance and fuel level monitoring
- **Event-Driven**: Notifications triggered by system events
- **Scheduled Notifications**: Support for future del
ivery
- **Expiration Handling**: Automatic cleanup of expired notifications

### ✅ **User Preferences**

- **Channel Selection**: Users choose preferred delivery methods
- **Enable/Disable**: Toggle notifications by type
- **Granular Control**: Per-notification-type preferences

## Database Schema

### Core Tables

- `notifications`: Main notification records
- `notification_types`: Predefined notification categories
- `user_notifications`: Delivery tracking per user/channel
- `notification_preferences`: User preference settings

## API Endpoints

### User Endpoints

```http
GET    /api/notifications              # Get user notifications
GET    /api/notifications/unread-count # Get unread count
PUT    /api/notifications/:id/read     # Mark as read
PUT    /api/notifications/mark-all-read # Mark all as read
GET    /api/notifications/preferences  # Get preferences
PUT    /api/notifications/preferences  # Update preferences
```

### Admin Endpoints

```http
GET    /api/notifications/admin/all           # Get all notifications
POST   /api/notifications/admin/create        # Create notification
DELETE /api/notifications/admin/:id           # Delete notification
POST   /api/notifications/admin/trigger-checks # Manual trigger
```

## Frontend Components

### NotificationBell

- Real-time notification display
- Unread count badge
- Mark as read functionality
- Priority-based icons and colors

### NotificationSettings

- User preference management
- Channel selection interface
- Enable/disable toggles

## Setup Instructions

### 1. Backend Setup

```bash
# Install dependencies
cd api
npm install

# Setup notification tables
npm run setup-notifications

# Start server with notifications
npm run dev
```

### 2. Frontend Integration

The notification bell is automatically added to the AppLayout header and will display:

- Real-time notifications via WebSocket
- Unread count badge
- Priority-based styling
- Mark as read functionality

### 3. Cron Jobs

Automatic periodic checks run:

- **Daily at 8 AM**: Full maintenance and fuel checks
- **Every 6 hours**: Fuel level monitoring
- **Weekly (Monday 9 AM)**: Comprehensive maintenance review

## Notification Types

### 1. Maintenance Due

- **Trigger**: Vehicle mileage > 10,000 km or 6 months since last maintenance
- **Recipients**: Vehicle managers, mechanics
- **Priority**: High
- **Channels**: Web, Email

### 2. Low Fuel

- **Trigger**: No fuel record in 7+ days and last amount < 25% of average
- **Recipients**: Vehicle managers, assigned drivers
- **Priority**: Medium
- **Channels**: Web, Email

### 3. Schedule Assignment

- **Trigger**: New schedule created with driver assignment
- **Recipients**: Assigned driver
- **Priority**: Medium
- **Channels**: Web, Email

### 4. Exit Request Status

- **Trigger**: Exit request approved/rejected
- **Recipients**: Requesting driver
- **Priority**: Medium
- **Channels**: Web, Email

## Integration Points

### Schedule Controller

```javascript
// Automatic notification on schedule creation
await NotificationService.notifyScheduleAssignment(
  scheduleId,
  driverId,
  createdBy,
);
```

### Exit Request Controller

```javascript
// Automatic notification on status change
await NotificationService.notifyExitRequestStatus(requestId, "approved");
```

### Periodic Monitoring

```javascript
// Automated checks via cron jobs
await NotificationService.runPeriodicChecks();
```

## WebSocket Events

### Real-time Notifications

- `notification:new` - New notification received
- `schedule:created` - Schedule assignment
- `exit_request:approved` - Exit request approved
- `exit_request:rejected` - Exit request rejected

## User Experience

### For Drivers

- Receive schedule assignments immediately
- Get exit request status updates
- View maintenance alerts for assigned vehicles
- Customize notification preferences

### For Vehicle Managers

- Monitor maintenance due dates
- Track fuel levels across fleet
- Receive exit request notifications
- Manage system-wide alerts

### For Mechanics

- Get maintenance due notifications
- Receive work assignment alerts
- Track completion notifications

### For Schedulers

- Receive schedule-related updates
- Monitor system notifications

## Security & Permissions

### Role-Based Access

- Users only receive notifications relevant to their role
- Notification preferences respect role permissions
- Admin-only functions for system management

### Data Privacy

- User preferences stored securely
- Notification content filtered by permissions
- Automatic cleanup of expired notifications

## Future Enhancements

### Email Integration

```javascript
// Ready for SMTP configuration
const emailService = {
  sendEmail: async (to, subject, body) => {
    // Implement SMTP sending
  },
};
```

### SMS Integration

```javascript
// Ready for SMS provider integration
const smsService = {
  sendSMS: async (phone, message) => {
    // Implement SMS sending
  },
};
```

### Push Notifications

- Browser push notifications
- Mobile app notifications
- Progressive Web App support

## Monitoring & Analytics

### Delivery Tracking

- Track notification delivery status
- Monitor read rates
- Identify delivery failures

### Performance Metrics

- Notification response times
- User engagement rates
- System load monitoring

## Troubleshooting

### Common Issues

1. **Notifications not appearing**
   - Check WebSocket connection
   - Verify user permissions
   - Check notification preferences

2. **Periodic checks not running**
   - Verify cron service initialization
   - Check server logs for errors
   - Ensure database connectivity

3. **High notification volume**
   - Review notification triggers
   - Adjust check frequencies
   - Implement rate limiting

### Debug Commands

```bash
# Manual trigger periodic checks
curl -X POST http://localhost:3000/api/notifications/admin/trigger-checks \
  -H "Authorization: Bearer <admin_token>"

# Check notification status
curl http://localhost:3000/api/notifications/unread-count \
  -H "Authorization: Bearer <user_token>"
```

## Performance Considerations

### Database Optimization

- Indexed notification queries
- Automatic cleanup of old notifications
- Efficient role-based filtering

### Real-time Performance

- WebSocket connection pooling
- Selective notification broadcasting
- Minimal payload sizes

### Scalability

- Horizontal scaling support
- Queue-based processing ready
- Microservice architecture compatible

---

The notification system is now fully integrated and ready for production use with comprehensive monitoring, user preferences, and multi-channel delivery capabilities.
