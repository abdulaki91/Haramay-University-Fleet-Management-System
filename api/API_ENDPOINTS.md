# API Endpoints Reference - Haramaya Fleet Management System

## Base URL

```
http://localhost:3000/api
```

## Authentication Header

All protected endpoints require:

```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication Endpoints

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@haramaya.edu.et",
  "password": "Admin@123"
}
```

### Get Profile

```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Change Password

```http
PUT /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "current_password": "Admin@123",
  "new_password": "NewPassword@123"
}
```

---

## 2. User Management (Admin Only)

### Create User

```http
POST /api/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@haramaya.edu.et",
  "password": "password123",
  "phone": "+251911111111",
  "role_id": 4
}
```

### Get All Users

```http
GET /api/users?page=1&limit=10
Authorization: Bearer <admin_token>
```

### Get User by ID

```http
GET /api/users/1
Authorization: Bearer <admin_token>
```

### Update User

```http
PUT /api/users/1
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Smith",
  "email": "john.smith@haramaya.edu.et",
  "phone": "+251922222222",
  "is_active": true
}
```

### Delete User

```http
DELETE /api/users/1
Authorization: Bearer <admin_token>
```

### Assign Role

```http
PUT /api/users/1/role
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "role_id": 2
}
```

### Get All Roles

```http
GET /api/users/roles
Authorization: Bearer <token>
```

---

## 3. Vehicle Management

### Register Vehicle (Vehicle Manager)

```http
POST /api/vehicles
Authorization: Bearer <vehicle_manager_token>
Content-Type: application/json

{
  "plate_number": "AA-12345",
  "make": "Toyota",
  "model": "Corolla",
  "year": 2022,
  "color": "White",
  "vin": "1HGBH41JXMN109186",
  "capacity": 5,
  "fuel_type": "petrol",
  "mileage": 15000
}
```

### Get All Vehicles

```http
GET /api/vehicles?page=1&limit=10&status=available
Authorization: Bearer <token>
```

### Get Vehicle by ID

```http
GET /api/vehicles/1
Authorization: Bearer <token>
```

### Search by Plate Number (Scheduler, Vehicle Manager)

```http
GET /api/vehicles/search/AA-123
Authorization: Bearer <token>
```

### Update Vehicle (Vehicle Manager)

```http
PUT /api/vehicles/1
Authorization: Bearer <vehicle_manager_token>
Content-Type: application/json

{
  "make": "Toyota",
  "model": "Camry",
  "year": 2023,
  "mileage": 20000
}
```

### Update Vehicle Status (Vehicle Manager)

```http
PUT /api/vehicles/1/status
Authorization: Bearer <vehicle_manager_token>
Content-Type: application/json

{
  "status": "maintenance"
}
```

**Status Options**: `available`, `in_use`, `maintenance`, `out_of_service`

---

## 4. Fuel Management

### Add Fuel Record (Driver, Vehicle Manager)

```http
POST /api/fuel
Authorization: Bearer <driver_token>
Content-Type: application/json

{
  "vehicle_id": 1,
  "fuel_amount": 45.5,
  "cost": 2500.00,
  "odometer_reading": 15500,
  "fuel_station": "Total Station",
  "receipt_number": "REC-001",
  "notes": "Full tank"
}
```

### Get All Fuel Records (Vehicle Manager)

```http
GET /api/fuel?page=1&limit=10
Authorization: Bearer <vehicle_manager_token>
```

### Get Fuel History for Vehicle (Vehicle Manager)

```http
GET /api/fuel/vehicle/1?page=1&limit=10
Authorization: Bearer <vehicle_manager_token>
```

### Calculate Fuel Consumption (Vehicle Manager)

```http
GET /api/fuel/vehicle/1/consumption
Authorization: Bearer <vehicle_manager_token>
```

### Calculate Fuel Balance (Vehicle Manager)

```http
GET /api/fuel/vehicle/1/balance
Authorization: Bearer <vehicle_manager_token>
```

---

## 5. Maintenance Management

### Create Maintenance Request (Driver)

```http
POST /api/maintenance
Authorization: Bearer <driver_token>
Content-Type: application/json

{
  "vehicle_id": 1,
  "title": "Oil Change Required",
  "description": "Vehicle needs oil change and filter replacement",
  "priority": "medium",
  "notes": "Last oil change was 6 months ago"
}
```

**Priority Options**: `low`, `medium`, `high`, `critical`

### Get All Maintenance Requests (Vehicle Manager, Mechanic)

```http
GET /api/maintenance?page=1&limit=10&status=pending
Authorization: Bearer <vehicle_manager_token>
```

### Get Maintenance Request by ID (Vehicle Manager, Mechanic)

```http
GET /api/maintenance/1
Authorization: Bearer <vehicle_manager_token>
```

### Update Maintenance Status (Vehicle Manager, Mechanic)

```http
PUT /api/maintenance/1/status
Authorization: Bearer <mechanic_token>
Content-Type: application/json

{
  "status": "in_progress",
  "assigned_to": 5,
  "estimated_cost": 5000.00,
  "notes": "Parts ordered, work will begin tomorrow"
}
```

**Status Options**: `pending`, `in_progress`, `completed`, `cancelled`

---

## 6. Schedule Management

### Create Schedule (Scheduler)

```http
POST /api/schedules
Authorization: Bearer <scheduler_token>
Content-Type: application/json

{
  "vehicle_id": 1,
  "driver_id": 4,
  "purpose": "Official Meeting",
  "destination": "Addis Ababa",
  "start_date": "2024-03-01T08:00:00",
  "end_date": "2024-03-01T18:00:00",
  "passengers": 3,
  "notes": "Pick up guests from airport"
}
```

### Get All Schedules (Admin, Scheduler, Driver, User)

```http
GET /api/schedules?page=1&limit=10&status=scheduled
Authorization: Bearer <token>
```

### Get Schedule by ID (Admin, Scheduler, Driver, User)

```http
GET /api/schedules/1
Authorization: Bearer <token>
```

### Update Schedule (Scheduler)

```http
PUT /api/schedules/1
Authorization: Bearer <scheduler_token>
Content-Type: application/json

{
  "purpose": "Updated Meeting",
  "destination": "Dire Dawa",
  "start_date": "2024-03-02T08:00:00",
  "end_date": "2024-03-02T18:00:00"
}
```

### Delete Schedule (Scheduler)

```http
DELETE /api/schedules/1
Authorization: Bearer <scheduler_token>
```

**Status Options**: `scheduled`, `in_progress`, `completed`, `cancelled`

---

## 7. Exit Request Management

### Create Exit Request (Driver)

```http
POST /api/exit-requests
Authorization: Bearer <driver_token>
Content-Type: application/json

{
  "vehicle_id": 1,
  "schedule_id": 1,
  "destination": "Harar",
  "purpose": "Document Delivery",
  "expected_return": "2024-03-01T17:00:00",
  "notes": "Urgent delivery"
}
```

### Get All Exit Requests (Vehicle Manager)

```http
GET /api/exit-requests?page=1&limit=10&status=pending
Authorization: Bearer <vehicle_manager_token>
```

### Get Approved Exit Requests (Security Guard)

```http
GET /api/exit-requests/approved?page=1&limit=10
Authorization: Bearer <security_guard_token>
```

### Get Exit Request by ID (Vehicle Manager, Security Guard)

```http
GET /api/exit-requests/1
Authorization: Bearer <vehicle_manager_token>
```

### Approve Exit Request (Vehicle Manager)

```http
PUT /api/exit-requests/1/approve
Authorization: Bearer <vehicle_manager_token>
```

### Reject Exit Request (Vehicle Manager)

```http
PUT /api/exit-requests/1/reject
Authorization: Bearer <vehicle_manager_token>
Content-Type: application/json

{
  "rejection_reason": "Vehicle is scheduled for maintenance"
}
```

**Status Options**: `pending`, `approved`, `rejected`, `completed`

---

## 8. Reports

### Vehicle Summary Report (Admin, Vehicle Manager)

```http
GET /api/reports/vehicles
Authorization: Bearer <admin_token>
```

**Response includes**:

- Total vehicles
- Vehicles by status
- Vehicles by fuel type

### Maintenance Report (Admin, Vehicle Manager)

```http
GET /api/reports/maintenance
Authorization: Bearer <vehicle_manager_token>
```

**Response includes**:

- Total requests
- Requests by status
- Requests by priority
- Cost summary
- Recent requests

### Fuel Usage Report (Admin, Vehicle Manager)

```http
GET /api/reports/fuel
Authorization: Bearer <vehicle_manager_token>
```

**Response includes**:

- Total refuels
- Total fuel consumed
- Total cost
- Usage by vehicle
- Recent refuels

### System Report (Admin Only)

```http
GET /api/reports/system
Authorization: Bearer <admin_token>
```

**Response includes**:

- User statistics
- Role distribution
- Schedule statistics
- Exit request statistics

---

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "details": {}
}
```

### Paginated Response

```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [],
  "pagination": {
    "current_page": 1,
    "per_page": 10,
    "total_items": 50,
    "total_pages": 5,
    "has_next": true,
    "has_prev": false
  }
}
```

---

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `500` - Internal Server Error

---

## Role-Based Access Summary

| Endpoint            | Admin | Vehicle Manager | Scheduler | Driver | Mechanic | User | Security Guard |
| ------------------- | ----- | --------------- | --------- | ------ | -------- | ---- | -------------- |
| User Management     | ✓     | ✗               | ✗         | ✗      | ✗        | ✗    | ✗              |
| Register Vehicle    | ✗     | ✓               | ✗         | ✗      | ✗        | ✗    | ✗              |
| View Vehicles       | ✓     | ✓               | ✓         | ✓      | ✓        | ✓    | ✓              |
| Search Vehicles     | ✗     | ✓               | ✓         | ✗      | ✗        | ✗    | ✗              |
| Fuel Management     | ✗     | ✓               | ✗         | ✓      | ✗        | ✗    | ✗              |
| Create Maintenance  | ✗     | ✗               | ✗         | ✓      | ✗        | ✗    | ✗              |
| View Maintenance    | ✗     | ✓               | ✗         | ✗      | ✓        | ✗    | ✗              |
| Create Schedule     | ✗     | ✗               | ✓         | ✗      | ✗        | ✗    | ✗              |
| View Schedules      | ✓     | ✗               | ✓         | ✓      | ✗        | ✓    | ✗              |
| Exit Requests       | ✗     | ✓               | ✗         | ✓      | ✗        | ✗    | ✗              |
| View Approved Exits | ✗     | ✗               | ✗         | ✗      | ✗        | ✗    | ✓              |
| Reports             | ✓     | ✓               | ✗         | ✗      | ✗        | ✗    | ✗              |
