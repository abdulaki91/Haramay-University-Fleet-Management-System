# Quick Reference Card

## Haramaya University Fleet Management System

---

## 🚀 Quick Start

```bash
npm install
npm run migrate
npm run seed
npm run dev
```

**Login**: `admin@haramaya.edu.et` / `Admin@123`

---

## 📁 Project Structure

```
src/
├── config/         # Database & configuration
├── models/         # Data models (7 models)
├── controllers/    # Business logic (8 controllers)
├── routes/         # API routes (8 route files)
├── middlewares/    # Auth, validation, errors
├── utils/          # Helpers (pagination, response)
└── server.js       # Entry point
```

---

## 🎭 User Roles

| Role            | ID  | Key Permissions                    |
| --------------- | --- | ---------------------------------- |
| Admin           | 1   | User management, system reports    |
| Vehicle Manager | 2   | Vehicles, fuel, approvals, reports |
| Scheduler       | 3   | Create/update schedules            |
| Driver          | 4   | Exit requests, maintenance, fuel   |
| Mechanic        | 5   | View/update maintenance            |
| User            | 6   | View schedules only                |
| Security Guard  | 7   | View approved exits only           |

---

## 🔑 API Endpoints

### Authentication

```
POST   /api/auth/login
GET    /api/auth/profile
PUT    /api/auth/change-password
```

### Users (Admin)

```
POST   /api/users
GET    /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
PUT    /api/users/:id/role
GET    /api/users/roles
```

### Vehicles

```
POST   /api/vehicles                    (Vehicle Manager)
GET    /api/vehicles
GET    /api/vehicles/:id
GET    /api/vehicles/search/:plate      (Scheduler, VM)
PUT    /api/vehicles/:id                (Vehicle Manager)
PUT    /api/vehicles/:id/status         (Vehicle Manager)
```

### Fuel

```
POST   /api/fuel                        (Driver, VM)
GET    /api/fuel                        (VM)
GET    /api/fuel/vehicle/:id            (VM)
GET    /api/fuel/vehicle/:id/consumption (VM)
GET    /api/fuel/vehicle/:id/balance    (VM)
```

### Maintenance

```
POST   /api/maintenance                 (Driver)
GET    /api/maintenance                 (VM, Mechanic)
GET    /api/maintenance/:id             (VM, Mechanic)
PUT    /api/maintenance/:id/status      (VM, Mechanic)
```

### Schedules

```
POST   /api/schedules                   (Scheduler)
GET    /api/schedules                   (Admin, Scheduler, Driver, User)
GET    /api/schedules/:id               (Admin, Scheduler, Driver, User)
PUT    /api/schedules/:id               (Scheduler)
DELETE /api/schedules/:id               (Scheduler)
```

### Exit Requests

```
POST   /api/exit-requests               (Driver)
GET    /api/exit-requests               (VM)
GET    /api/exit-requests/approved      (Security Guard)
GET    /api/exit-requests/:id           (VM, Security Guard)
PUT    /api/exit-requests/:id/approve   (VM)
PUT    /api/exit-requests/:id/reject    (VM)
```

### Reports

```
GET    /api/reports/vehicles            (Admin, VM)
GET    /api/reports/maintenance         (Admin, VM)
GET    /api/reports/fuel                (Admin, VM)
GET    /api/reports/system              (Admin)
```

---

## 🔐 Authentication

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@haramaya.edu.et","password":"Admin@123"}'
```

### Use Token

```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📊 Response Format

### Success

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "error": "Error message"
}
```

### Paginated

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "current_page": 1,
    "per_page": 10,
    "total_items": 50,
    "total_pages": 5
  }
}
```

---

## 🗄️ Database Tables

1. **roles** - User roles
2. **users** - User accounts
3. **vehicles** - Fleet vehicles
4. **fuel_records** - Fuel tracking
5. **maintenance_requests** - Maintenance
6. **schedules** - Vehicle schedules
7. **exit_requests** - Exit permissions

---

## ⚙️ Environment Variables

```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=haramaya_fleet
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
```

---

## 🛠️ NPM Scripts

```bash
npm start          # Production server
npm run dev        # Development server
npm run migrate    # Create tables
npm run seed       # Seed default data
```

---

## 🔍 Common Commands

### Check Server Status

```bash
curl http://localhost:3000/health
```

### View All Users (Admin)

```bash
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer TOKEN"
```

### Register Vehicle (VM)

```bash
curl -X POST http://localhost:3000/api/vehicles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "plate_number":"AA-12345",
    "make":"Toyota",
    "model":"Corolla",
    "year":2022,
    "fuel_type":"petrol"
  }'
```

### Create Schedule (Scheduler)

```bash
curl -X POST http://localhost:3000/api/schedules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "vehicle_id":1,
    "driver_id":3,
    "purpose":"Meeting",
    "destination":"Addis Ababa",
    "start_date":"2024-03-15T08:00:00",
    "end_date":"2024-03-15T18:00:00"
  }'
```

---

## 🚨 HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation)
- `401` - Unauthorized (no/invalid token)
- `403` - Forbidden (no permission)
- `404` - Not Found
- `409` - Conflict (duplicate)
- `500` - Server Error

---

## 🔧 Troubleshooting

### Can't Connect to Database

```bash
# Check MySQL is running
sudo systemctl status mysql

# Test connection
mysql -u root -p
```

### Token Expired

- Login again to get new token
- Default expiry: 7 days

### Permission Denied (403)

- Check user role
- Verify endpoint permissions
- Use correct role's token

### Validation Error (400)

- Check required fields
- Verify data types
- Review API documentation

---

## 📚 Documentation Files

1. **README.md** - Main documentation
2. **SETUP_INSTRUCTIONS.md** - Setup guide
3. **API_ENDPOINTS.md** - Complete API reference
4. **ROLE_PERMISSIONS.md** - Permission matrix
5. **TESTING_GUIDE.md** - Testing scenarios
6. **DEPLOYMENT_CHECKLIST.md** - Deployment guide
7. **PROJECT_SUMMARY.md** - Project overview
8. **COMPLETION_REPORT.md** - Final report

---

## 🎯 Workflows

### Exit Permission Flow

1. Driver creates exit request
2. Vehicle Manager approves/rejects
3. Security Guard views approved

### Maintenance Flow

1. Driver creates request
2. Mechanic views and updates
3. Vehicle Manager monitors

### Fuel Tracking Flow

1. Driver adds fuel record
2. Vehicle Manager views history
3. Vehicle Manager calculates balance

---

## 📞 Quick Help

**Server not starting?**

- Check `.env` file exists
- Verify database credentials
- Run `npm install`

**Can't login?**

- Run `npm run seed` first
- Use default credentials
- Check database connection

**API not responding?**

- Check server is running
- Verify port (default: 3000)
- Check firewall settings

---

## ✅ Checklist

**Initial Setup**

- [ ] Install dependencies
- [ ] Configure `.env`
- [ ] Run migrations
- [ ] Run seed
- [ ] Start server
- [ ] Test login

**First Use**

- [ ] Login as admin
- [ ] Change admin password
- [ ] Create users for each role
- [ ] Register vehicles
- [ ] Test workflows

---

**Version**: 1.0.0
**Port**: 3000
**Base URL**: `http://localhost:3000/api`

---

_Haramaya University Fleet Management System_
_Quick Reference Card_
