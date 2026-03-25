# Notification System Setup Instructions

## Prerequisites

1. **MySQL/MariaDB Server Running**
   - Make sure your MySQL server is running
   - Update the `.env` file with correct database credentials

2. **Database Connection**
   - Verify connection by starting the main server: `npm start`
   - If connection fails, check your MySQL service

## Setup Steps

### Option 1: Automatic Setup (Recommended)

The notification tables are now integrated into the main database initialization.

```bash
# Start the server (this will create all tables including notifications)
npm start
```

### Option 2: Manual Setup

If you need to set up notifications separately:

```bash
# Run the notification setup script
npm run setup-notifications
```

### Option 3: SQL Manual Setup

If scripts fail, you can run the SQL manually:

```sql
-- Copy and paste the contents of api/migrations/create_notifications_tables.sql
-- into your MySQL client
```

## Verification

Once setup is complete, you should see these new tables in your database:

- `notification_types`
- `notifications`
- `user_notifications`
- `notification_preferences`

## Troubleshooting

### Database Connection Issues

1. Check if MySQL is running: `mysql -u root -p`
2. Verify credentials in `.env` file
3. Make sure database `haramaya_fleet` exists

### Permission Issues

1. Make sure MySQL user has CREATE privileges
2. Check if user can create databases and tables

### Table Already Exists

- The setup scripts use `CREATE TABLE IF NOT EXISTS` so they're safe to run multiple times
- `INSERT IGNORE` is used for default data to prevent duplicates

## Testing the Notification System

Once setup is complete:

1. **Start the server**: `npm start`
2. **Check the logs**: You should see "✓ Notification cron jobs initialized"
3. **Test the API**: Try accessing `/api/notifications/unread-count` with a valid token
4. **Frontend**: The notification bell should appear in the header

## Features Available After Setup

- ✅ Real-time web notifications
- ✅ Automatic maintenance due alerts
- ✅ Low fuel notifications
- ✅ Schedule assignment notifications
- ✅ Exit request status updates
- ✅ User notification preferences
- ✅ Periodic automated checks
- ✅ Role-based notification filtering

## Next Steps

After successful setup:

1. Login to the frontend
2. Look for the notification bell icon in the header
3. Check notification preferences in user settings
4. Test by creating a schedule or exit request
5. Verify notifications appear in real-time
