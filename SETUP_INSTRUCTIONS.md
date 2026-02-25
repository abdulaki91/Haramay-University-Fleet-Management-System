# Setup Instructions - Haramaya University Fleet Management System

## Quick Start Guide

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your MySQL credentials:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=haramaya_fleet
DB_PORT=3306

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

DEFAULT_PAGE_SIZE=10
MAX_PAGE_SIZE=100
```

### Step 3: Create Database

Open MySQL and run:

```sql
CREATE DATABASE haramaya_fleet;
```

Or let the migration script create it automatically (recommended).

### Step 4: Run Migrations

This will create all database tables:

```bash
npm run migrate
```

### Step 5: Seed Default Data

This will create roles and default admin user:

```bash
npm run seed
```

### Step 6: Start the Server

**Development mode** (with auto-reload):

```bash
npm run dev
```

**Production mode**:

```bash
npm start
```

The server will start on `http://localhost:3000`

## Default Login Credentials

After seeding, use these credentials:

- **Email**: `admin@haramaya.edu.et`
- **Password**: `Admin@123`

**⚠️ SECURITY**: Change this password immediately after first login!

## Testing the API

### 1. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@haramaya.edu.et","password":"Admin@123"}'
```

Save the returned token for subsequent requests.

### 2. Get Your Profile

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Create a New User

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "first_name":"John",
    "last_name":"Doe",
    "email":"john@haramaya.edu.et",
    "password":"password123",
    "phone":"+251911111111",
    "role_id":4
  }'
```

## Role IDs Reference

After seeding, roles will have these IDs:

1. admin
2. vehicle_manager
3. scheduler
4. driver
5. mechanic
6. user
7. security_guard

## Troubleshooting

### Database Connection Error

- Verify MySQL is running
- Check credentials in `.env`
- Ensure database exists

### Port Already in Use

Change the PORT in `.env` file:

```env
PORT=3001
```

### Migration Fails

- Ensure MySQL user has CREATE privileges
- Check database connection settings
- Verify MySQL version (5.7+)

### Seed Fails

- Run migrations first: `npm run migrate`
- Check if tables exist in database
- Verify database connection

## Next Steps

1. Change default admin password
2. Create users for each role
3. Register vehicles
4. Test the complete workflow
5. Configure production environment

## Production Deployment

### Environment Variables

Update `.env` for production:

```env
NODE_ENV=production
JWT_SECRET=use_a_very_strong_random_secret_here
DB_HOST=your_production_db_host
```

### Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up database backups
- [ ] Enable logging
- [ ] Use environment-specific configs

### Running in Production

```bash
npm start
```

Or use a process manager like PM2:

```bash
npm install -g pm2
pm2 start src/server.js --name haramaya-fleet
pm2 save
pm2 startup
```

## Support

For issues or questions, contact the Haramaya University IT Department.
