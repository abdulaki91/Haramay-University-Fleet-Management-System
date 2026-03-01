# Quick Start Guide - Haramaya Fleet Management System

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Installation & Setup

### 1. Clone and Install

```bash
# Install backend dependencies
cd api
npm install

# Install frontend dependencies
cd ../Frontend
npm install
```

### 2. Database Setup

```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE haramaya_fleet;
exit;

# Configure backend environment
cd api
cp .env.example .env
```

Edit `api/.env` with your database credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=haramaya_fleet
DB_PORT=3306
JWT_SECRET=your_secret_key_here
FRONTEND_URL=http://localhost:5173
```

### 3. Initialize Database

```bash
# Run migrations (create tables)
cd api
npm run migrate

# Seed initial data (creates admin user and sample data)
npm run seed
```

### 4. Configure Frontend

```bash
cd Frontend
cp .env.example .env
```

Verify `Frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Running the Application

### Start Backend Server

```bash
cd api
npm run dev
```

Server will start on `http://localhost:3000`

- API: `http://localhost:3000/api`
- WebSocket: `ws://localhost:3000`

### Start Frontend

```bash
cd Frontend
npm run dev
```

Frontend will start on `http://localhost:5173`

## Default Login Credentials

After running the seed script, you can login with:

**System Admin**

- Email: `admin@haramaya.edu.et`
- Password: `Admin@123`

**Vehicle Manager**

- Email: `manager@haramaya.edu.et`
- Password: `Manager@123`

**Driver**

- Email: `driver@haramaya.edu.et`
- Password: `Driver@123`

**Security Guard**

- Email: `guard@haramaya.edu.et`
- Password: `Guard@123`

**Mechanic**

- Email: `mechanic@haramaya.edu.et`
- Password: `Mechanic@123`

**Scheduler**

- Email: `scheduler@haramaya.edu.et`
- Password: `Scheduler@123`

## Testing Real-Time Features

1. Open two browser windows
2. Login as **Driver** in window 1
3. Login as **Vehicle Manager** in window 2
4. In window 1 (Driver):
   - Navigate to "Exit Workflow"
   - Create a new exit request
5. In window 2 (Vehicle Manager):
   - You should see a real-time notification
   - The exit request appears immediately without refresh
   - Approve or reject the request
6. In window 1 (Driver):
   - You should see a real-time notification
   - The status updates immediately

## Project Structure

```
.
├── api/                          # Backend (Node.js + Express)
│   ├── config/                   # Database configuration
│   ├── controllers/              # Request handlers
│   ├── middlewares/              # Auth, validation, error handling
│   ├── models/                   # Database models
│   ├── routes/                   # API routes
│   ├── services/                 # Socket.IO service
│   ├── utils/                    # Helper functions
│   └── server.js                 # Entry point
│
├── Frontend/                     # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── api/                  # API services
│   │   │   └── services/         # Real API implementations
│   │   ├── components/           # Reusable components
│   │   ├── hooks/                # Custom React hooks
│   │   ├── pages/                # Page components
│   │   ├── services/             # Socket.IO client
│   │   ├── store/                # Zustand state management
│   │   └── types/                # TypeScript types
│   └── public/                   # Static assets
│
└── INTEGRATION_GUIDE.md          # Detailed integration docs
```

## Available Scripts

### Backend

```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm run migrate  # Run database migrations
npm run seed     # Seed database with sample data
```

### Frontend

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm test         # Run tests
```

## API Endpoints

Full API documentation available at: `api/API_ENDPOINTS.md`

Key endpoints:

- `POST /api/auth/login` - User authentication
- `GET /api/vehicles` - List all vehicles
- `GET /api/schedules` - List all schedules
- `POST /api/exit-requests` - Create exit request
- `POST /api/maintenance` - Create maintenance request
- `GET /api/reports/vehicles` - Vehicle summary report

## Real-Time Events

The system uses Socket.IO for real-time updates:

### Exit Requests

- `exit_request:created` - New request submitted
- `exit_request:approved` - Request approved
- `exit_request:rejected` - Request rejected

### Maintenance

- `maintenance:created` - New maintenance request
- `maintenance:updated` - Status updated
- `maintenance:assigned` - Mechanic assigned

### Schedules

- `schedule:created` - New schedule created
- `schedule:updated` - Schedule modified

### Vehicles

- `vehicle:updated` - Vehicle information changed

## Troubleshooting

### Backend won't start

- Check MySQL is running: `mysql -u root -p`
- Verify database exists: `SHOW DATABASES;`
- Check `.env` configuration
- Ensure port 3000 is not in use

### Frontend won't connect to backend

- Verify backend is running on port 3000
- Check `VITE_API_BASE_URL` in `Frontend/.env`
- Check browser console for CORS errors
- Clear browser cache and localStorage

### WebSocket not connecting

- Check backend console for socket connection logs
- Verify JWT token is valid (try logging out and back in)
- Check `FRONTEND_URL` in backend `.env`
- Inspect Network tab in browser DevTools

### Database errors

- Run migrations: `npm run migrate`
- Check database credentials in `.env`
- Ensure MySQL user has proper permissions

## Next Steps

1. **Explore the Dashboard**: Login and navigate through different pages
2. **Test Role-Based Access**: Try logging in with different roles
3. **Create Test Data**: Add vehicles, schedules, and requests
4. **Monitor Real-Time Updates**: Open multiple windows to see live updates
5. **Review Documentation**: Check `INTEGRATION_GUIDE.md` for detailed info

## Support & Documentation

- **API Documentation**: `api/API_ENDPOINTS.md`
- **Integration Guide**: `INTEGRATION_GUIDE.md`
- **Role Permissions**: `api/ROLE_PERMISSIONS.md`
- **Setup Instructions**: `api/SETUP_INSTRUCTIONS.md`
- **Testing Guide**: `api/TESTING_GUIDE.md`

## Production Deployment

Before deploying to production:

1. Change JWT_SECRET to a strong random string
2. Update database credentials
3. Set NODE_ENV=production
4. Configure proper CORS origins
5. Enable HTTPS
6. Set up database backups
7. Configure logging and monitoring
8. Review security best practices

See `DEPLOYMENT_CHECKLIST.md` for complete deployment guide.
