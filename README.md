# Haramaya University Fleet Management System

A complete production-ready backend system for managing university fleet operations including vehicles, fuel, maintenance, scheduling, and exit permissions with role-based access control.

## Features

- **User Management**: Complete CRUD operations with role assignment (Admin only)
- **Vehicle Management**: Register, update, search vehicles (Vehicle Manager, Scheduler)
- **Fuel Management**: Track fuel records, calculate consumption and balance (Vehicle Manager)
- **Maintenance Management**: Request and track vehicle maintenance (Driver, Mechanic, Vehicle Manager)
- **Scheduling**: Create and manage vehicle schedules (Scheduler)
- **Exit Permission Workflow**: Request, approve/reject exit permissions (Driver, Vehicle Manager, Security Guard)
- **Comprehensive Reporting**: Vehicle, maintenance, fuel, and system reports (Admin, Vehicle Manager)

## Tech Stack

- **Backend**: Node.js & Express.js
- **Database**: MySQL with mysql2
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcrypt for password hashing
- **Architecture**: MVC (Model-View-Controller)
- **Validation**: express-validator

## User Roles and Permissions

### 1. Admin

- Create, update, delete user accounts
- Assign roles to users
- View scheduled vehicles
- Generate system reports

### 2. Vehicle Manager

- Register and update vehicles
- Search vehicle information
- Calculate fuel balance
- View maintenance requests
- Approve/reject exit permission requests
- Notify exit permission decisions
- Generate reports (vehicle, maintenance, fuel)

### 3. Scheduler

- Prepare vehicle schedules
- Update schedules
- Search vehicle information
- View scheduled vehicles

### 4. Driver

- View scheduled vehicles
- Request exit permission
- Request maintenance records
- Add fuel records

### 5. Mechanic

- View maintenance requests
- Update maintenance status

### 6. User

- View scheduled vehicles only

### 7. Security Guard

- View approved exit permissions only

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Setup Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd haramaya-fleet-management
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` file with your database credentials:

   ```env
   PORT=3000
   NODE_ENV=development

   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=haramaya_fleet
   DB_PORT=3306

   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRE=7d
   ```

4. **Create MySQL database**

   ```sql
   CREATE DATABASE haramaya_fleet;
   ```

5. **Run migrations** (creates all tables automatically)

   ```bash
   npm run migrate
   ```

6. **Seed default data** (roles and admin user)
   ```bash
   npm run seed
   ```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:3000`

## Default Admin Credentials

After seeding, use these credentials to login:

- **Email**: `admin@haramaya.edu.et`
- **Password**: `Admin@123`

**⚠️ IMPORTANT**: Change this password immediately after first login!

## API Documentation

### Base URL

```
http://localhost:3000/api
```

### Authentication

All protected routes require JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### API Endpoints

#### Authentication

- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/change-password` - Change password

#### Users (Admin only)

- `POST /api/users` - Create user
- `GET /api/users` - Get all users (paginated)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PUT /api/users/:id/role` - Assign role
- `GET /api/users/roles` - Get all roles

#### Vehicles

- `POST /api/vehicles` - Register vehicle (Vehicle Manager)
- `GET /api/vehicles` - Get all vehicles (paginated)
- `GET /api/vehicles/:id` - Get vehicle by ID
- `GET /api/vehicles/search/:plateNumber` - Search by plate (Scheduler, Vehicle Manager)
- `PUT /api/vehicles/:id` - Update vehicle (Vehicle Manager)
- `PUT /api/vehicles/:id/status` - Update status (Vehicle Manager)

#### Fuel

- `POST /api/fuel` - Add fuel record (Driver, Vehicle Manager)
- `GET /api/fuel` - Get all fuel records (Vehicle Manager)
- `GET /api/fuel/vehicle/:vehicleId` - Get fuel history (Vehicle Manager)
- `GET /api/fuel/vehicle/:vehicleId/consumption` - Calculate consumption (Vehicle Manager)
- `GET /api/fuel/vehicle/:vehicleId/balance` - Calculate balance (Vehicle Manager)

#### Maintenance

- `POST /api/maintenance` - Create request (Driver)
- `GET /api/maintenance` - Get all requests (Vehicle Manager, Mechanic)
- `GET /api/maintenance/:id` - Get request by ID (Vehicle Manager, Mechanic)
- `PUT /api/maintenance/:id/status` - Update status (Vehicle Manager, Mechanic)

#### Schedules

- `POST /api/schedules` - Create schedule (Scheduler)
- `GET /api/schedules` - Get all schedules (Admin, Scheduler, Driver, User)
- `GET /api/schedules/:id` - Get schedule by ID (Admin, Scheduler, Driver, User)
- `PUT /api/schedules/:id` - Update schedule (Scheduler)
- `DELETE /api/schedules/:id` - Delete schedule (Scheduler)

#### Exit Requests

- `POST /api/exit-requests` - Create request (Driver)
- `GET /api/exit-requests` - Get all requests (Vehicle Manager)
- `GET /api/exit-requests/approved` - Get approved requests (Security Guard)
- `GET /api/exit-requests/:id` - Get request by ID (Vehicle Manager, Security Guard)
- `PUT /api/exit-requests/:id/approve` - Approve request (Vehicle Manager)
- `PUT /api/exit-requests/:id/reject` - Reject request (Vehicle Manager)

#### Reports

- `GET /api/reports/vehicles` - Vehicle summary (Admin, Vehicle Manager)
- `GET /api/reports/maintenance` - Maintenance report (Admin, Vehicle Manager)
- `GET /api/reports/fuel` - Fuel usage report (Admin, Vehicle Manager)
- `GET /api/reports/system` - System report (Admin)

### Example API Requests

#### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@haramaya.edu.et","password":"Admin@123"}'
```

#### Create User (Admin)

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "first_name":"John",
    "last_name":"Doe",
    "email":"john@haramaya.edu.et",
    "password":"password123",
    "phone":"+251911111111",
    "role_id":4
  }'
```

#### Register Vehicle (Vehicle Manager)

```bash
curl -X POST http://localhost:3000/api/vehicles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "plate_number":"AA-12345",
    "make":"Toyota",
    "model":"Corolla",
    "year":2022,
    "fuel_type":"petrol",
    "capacity":5
  }'
```

## Database Schema

### Tables

- `roles` - User roles
- `users` - System users
- `vehicles` - Fleet vehicles
- `fuel_records` - Fuel consumption records
- `maintenance_requests` - Maintenance requests
- `schedules` - Vehicle schedules
- `exit_requests` - Exit permission requests

### Relationships

- Users belong to Roles (many-to-one)
- Fuel Records belong to Vehicles and Users (many-to-one)
- Maintenance Requests belong to Vehicles and Users (many-to-one)
- Schedules belong to Vehicles and Users (many-to-one)
- Exit Requests belong to Vehicles, Users, and Schedules (many-to-one)

## Project Structure

```
haramaya-fleet-management/
├── src/
│   ├── config/
│   │   ├── database.js          # Database connection pool
│   │   ├── createTables.js      # Table creation logic
│   │   ├── migrate.js           # Migration script
│   │   ├── seed.js              # Seed script
│   │   └── schema.sql           # SQL schema (reference)
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── vehicleController.js
│   │   ├── fuelController.js
│   │   ├── maintenanceController.js
│   │   ├── scheduleController.js
│   │   ├── exitRequestController.js
│   │   └── reportController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Role.js
│   │   ├── Vehicle.js
│   │   ├── FuelRecord.js
│   │   ├── MaintenanceRequest.js
│   │   ├── Schedule.js
│   │   └── ExitRequest.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── vehicleRoutes.js
│   │   ├── fuelRoutes.js
│   │   ├── maintenanceRoutes.js
│   │   ├── scheduleRoutes.js
│   │   ├── exitRequestRoutes.js
│   │   └── reportRoutes.js
│   ├── middlewares/
│   │   ├── auth.js               # Authentication & authorization
│   │   ├── validate.js           # Validation middleware
│   │   └── errorHandler.js       # Error handling
│   ├── utils/
│   │   ├── pagination.js         # Pagination utilities
│   │   └── response.js           # Response formatters
│   └── server.js                 # Application entry point
├── .env.example                  # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## Features Implementation

### Automatic Table Creation

Tables are automatically created when the server starts. No manual SQL execution needed.

### Role-Based Access Control

Every endpoint is protected with role-based middleware ensuring users can only access authorized resources.

### Centralized Error Handling

All errors are caught and formatted consistently with appropriate HTTP status codes.

### Request Validation

Input validation using express-validator on all POST/PUT endpoints.

### Pagination

List endpoints support pagination with configurable page size.

### Standardized Responses

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt (10 rounds)
- Role-based authorization
- SQL injection prevention (parameterized queries)
- Input validation and sanitization
- Environment variable configuration

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed default data

### Adding New Features

1. Create model in `src/models/`
2. Create controller in `src/controllers/`
3. Create routes in `src/routes/`
4. Add routes to `src/server.js`
5. Update database schema in `src/config/createTables.js`

## Troubleshooting

### Database Connection Issues

- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database exists

### Authentication Errors

- Verify JWT_SECRET is set in `.env`
- Check token expiration
- Ensure user account is active

### Permission Denied

- Verify user role has required permissions
- Check authorization middleware configuration

## License

MIT License - Haramaya University

## Support

For issues and questions, contact the development team at Haramaya University IT Department.
