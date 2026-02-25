# Testing Guide - Haramaya Fleet Management System

## Prerequisites

- Server running on `http://localhost:3000`
- Database migrated and seeded
- API testing tool (Postman, curl, or similar)

---

## Step 1: Login as Admin

### Request

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@haramaya.edu.et",
    "password": "Admin@123"
  }'
```

### Expected Response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "first_name": "System",
      "last_name": "Administrator",
      "email": "admin@haramaya.edu.et",
      "phone": "+251911000000",
      "role": "admin"
    }
  }
}
```

**Save the token** - you'll need it for subsequent requests!

---

## Step 2: Create Users for Each Role

### 2.1 Create Vehicle Manager

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "first_name": "Ahmed",
    "last_name": "Hassan",
    "email": "ahmed.hassan@haramaya.edu.et",
    "password": "password123",
    "phone": "+251911111111",
    "role_id": 2
  }'
```

### 2.2 Create Scheduler

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "first_name": "Fatima",
    "last_name": "Mohammed",
    "email": "fatima.mohammed@haramaya.edu.et",
    "password": "password123",
    "phone": "+251922222222",
    "role_id": 3
  }'
```

### 2.3 Create Driver

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "first_name": "Abebe",
    "last_name": "Kebede",
    "email": "abebe.kebede@haramaya.edu.et",
    "password": "password123",
    "phone": "+251933333333",
    "role_id": 4
  }'
```

### 2.4 Create Mechanic

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "first_name": "Dawit",
    "last_name": "Tesfaye",
    "email": "dawit.tesfaye@haramaya.edu.et",
    "password": "password123",
    "phone": "+251944444444",
    "role_id": 5
  }'
```

### 2.5 Create Security Guard

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "first_name": "Yohannes",
    "last_name": "Girma",
    "email": "yohannes.girma@haramaya.edu.et",
    "password": "password123",
    "phone": "+251955555555",
    "role_id": 7
  }'
```

---

## Step 3: Login as Vehicle Manager

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmed.hassan@haramaya.edu.et",
    "password": "password123"
  }'
```

**Save the Vehicle Manager token**

---

## Step 4: Register Vehicles (as Vehicle Manager)

### 4.1 Register First Vehicle

```bash
curl -X POST http://localhost:3000/api/vehicles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VEHICLE_MANAGER_TOKEN" \
  -d '{
    "plate_number": "AA-12345",
    "make": "Toyota",
    "model": "Corolla",
    "year": 2022,
    "color": "White",
    "vin": "1HGBH41JXMN109186",
    "capacity": 5,
    "fuel_type": "petrol",
    "mileage": 15000
  }'
```

### 4.2 Register Second Vehicle

```bash
curl -X POST http://localhost:3000/api/vehicles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VEHICLE_MANAGER_TOKEN" \
  -d '{
    "plate_number": "AA-67890",
    "make": "Toyota",
    "model": "Hiace",
    "year": 2021,
    "color": "Silver",
    "capacity": 14,
    "fuel_type": "diesel",
    "mileage": 25000
  }'
```

---

## Step 5: Login as Scheduler

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "fatima.mohammed@haramaya.edu.et",
    "password": "password123"
  }'
```

**Save the Scheduler token**

---

## Step 6: Create Schedule (as Scheduler)

```bash
curl -X POST http://localhost:3000/api/schedules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SCHEDULER_TOKEN" \
  -d '{
    "vehicle_id": 1,
    "driver_id": 3,
    "purpose": "Official Meeting",
    "destination": "Addis Ababa",
    "start_date": "2024-03-15T08:00:00",
    "end_date": "2024-03-15T18:00:00",
    "passengers": 3,
    "notes": "Pick up guests from airport"
  }'
```

---

## Step 7: Login as Driver

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "abebe.kebede@haramaya.edu.et",
    "password": "password123"
  }'
```

**Save the Driver token**

---

## Step 8: Driver Actions

### 8.1 View Schedules

```bash
curl -X GET http://localhost:3000/api/schedules \
  -H "Authorization: Bearer DRIVER_TOKEN"
```

### 8.2 Add Fuel Record

```bash
curl -X POST http://localhost:3000/api/fuel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer DRIVER_TOKEN" \
  -d '{
    "vehicle_id": 1,
    "fuel_amount": 45.5,
    "cost": 2500.00,
    "odometer_reading": 15500,
    "fuel_station": "Total Station",
    "receipt_number": "REC-001",
    "notes": "Full tank"
  }'
```

### 8.3 Create Maintenance Request

```bash
curl -X POST http://localhost:3000/api/maintenance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer DRIVER_TOKEN" \
  -d '{
    "vehicle_id": 1,
    "title": "Oil Change Required",
    "description": "Vehicle needs oil change and filter replacement",
    "priority": "medium",
    "notes": "Last oil change was 6 months ago"
  }'
```

### 8.4 Create Exit Request

```bash
curl -X POST http://localhost:3000/api/exit-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer DRIVER_TOKEN" \
  -d '{
    "vehicle_id": 1,
    "schedule_id": 1,
    "destination": "Harar",
    "purpose": "Document Delivery",
    "expected_return": "2024-03-15T17:00:00",
    "notes": "Urgent delivery"
  }'
```

---

## Step 9: Vehicle Manager Actions

### 9.1 View Exit Requests

```bash
curl -X GET http://localhost:3000/api/exit-requests \
  -H "Authorization: Bearer VEHICLE_MANAGER_TOKEN"
```

### 9.2 Approve Exit Request

```bash
curl -X PUT http://localhost:3000/api/exit-requests/1/approve \
  -H "Authorization: Bearer VEHICLE_MANAGER_TOKEN"
```

### 9.3 Calculate Fuel Balance

```bash
curl -X GET http://localhost:3000/api/fuel/vehicle/1/balance \
  -H "Authorization: Bearer VEHICLE_MANAGER_TOKEN"
```

### 9.4 Search Vehicle

```bash
curl -X GET http://localhost:3000/api/vehicles/search/AA-123 \
  -H "Authorization: Bearer VEHICLE_MANAGER_TOKEN"
```

---

## Step 10: Login as Mechanic

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dawit.tesfaye@haramaya.edu.et",
    "password": "password123"
  }'
```

### View and Update Maintenance

```bash
# View maintenance requests
curl -X GET http://localhost:3000/api/maintenance \
  -H "Authorization: Bearer MECHANIC_TOKEN"

# Update maintenance status
curl -X PUT http://localhost:3000/api/maintenance/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer MECHANIC_TOKEN" \
  -d '{
    "status": "in_progress",
    "notes": "Parts ordered, work will begin tomorrow"
  }'
```

---

## Step 11: Login as Security Guard

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "yohannes.girma@haramaya.edu.et",
    "password": "password123"
  }'
```

### View Approved Exit Requests

```bash
curl -X GET http://localhost:3000/api/exit-requests/approved \
  -H "Authorization: Bearer SECURITY_GUARD_TOKEN"
```

---

## Step 12: Generate Reports (as Vehicle Manager or Admin)

### Vehicle Summary Report

```bash
curl -X GET http://localhost:3000/api/reports/vehicles \
  -H "Authorization: Bearer VEHICLE_MANAGER_TOKEN"
```

### Maintenance Report

```bash
curl -X GET http://localhost:3000/api/reports/maintenance \
  -H "Authorization: Bearer VEHICLE_MANAGER_TOKEN"
```

### Fuel Usage Report

```bash
curl -X GET http://localhost:3000/api/reports/fuel \
  -H "Authorization: Bearer VEHICLE_MANAGER_TOKEN"
```

### System Report (Admin only)

```bash
curl -X GET http://localhost:3000/api/reports/system \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## Testing Permission Denials

### Test 1: Driver tries to create user (should fail)

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer DRIVER_TOKEN" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "email": "test@haramaya.edu.et",
    "password": "password123",
    "role_id": 6
  }'
```

**Expected**: 403 Forbidden

### Test 2: User tries to create schedule (should fail)

```bash
curl -X POST http://localhost:3000/api/schedules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{
    "vehicle_id": 1,
    "driver_id": 3,
    "purpose": "Test",
    "destination": "Test",
    "start_date": "2024-03-15T08:00:00",
    "end_date": "2024-03-15T18:00:00"
  }'
```

**Expected**: 403 Forbidden

### Test 3: Security Guard tries to approve exit request (should fail)

```bash
curl -X PUT http://localhost:3000/api/exit-requests/1/approve \
  -H "Authorization: Bearer SECURITY_GUARD_TOKEN"
```

**Expected**: 403 Forbidden

---

## Testing Validation

### Test Invalid Email

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "password123"
  }'
```

**Expected**: 400 Bad Request with validation errors

### Test Missing Required Fields

```bash
curl -X POST http://localhost:3000/api/vehicles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VEHICLE_MANAGER_TOKEN" \
  -d '{
    "plate_number": "AA-11111"
  }'
```

**Expected**: 400 Bad Request with validation errors

---

## Testing Pagination

```bash
# Get first page
curl -X GET "http://localhost:3000/api/vehicles?page=1&limit=5" \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Get second page
curl -X GET "http://localhost:3000/api/vehicles?page=2&limit=5" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## Health Check

```bash
curl -X GET http://localhost:3000/health
```

**Expected**:

```json
{
  "status": "OK",
  "message": "Haramaya Fleet Management System is running"
}
```

---

## Complete Workflow Test

1. ✅ Admin creates users for all roles
2. ✅ Vehicle Manager registers vehicles
3. ✅ Scheduler creates schedules
4. ✅ Driver views schedules
5. ✅ Driver adds fuel record
6. ✅ Driver creates maintenance request
7. ✅ Driver creates exit request
8. ✅ Mechanic views and updates maintenance
9. ✅ Vehicle Manager approves exit request
10. ✅ Security Guard views approved exits
11. ✅ Vehicle Manager generates reports
12. ✅ Admin views system report

---

## Troubleshooting

### 401 Unauthorized

- Check if token is valid
- Verify token is included in Authorization header
- Token may have expired (default: 7 days)

### 403 Forbidden

- User role doesn't have permission for this action
- Verify you're using the correct role's token

### 404 Not Found

- Check the endpoint URL
- Verify resource ID exists

### 400 Bad Request

- Check request body format
- Verify all required fields are included
- Check validation rules

---

## Postman Collection

You can import these requests into Postman:

1. Create a new collection
2. Add environment variables for tokens
3. Copy the curl commands and convert to Postman requests
4. Use `{{admin_token}}`, `{{driver_token}}`, etc. for tokens

---

## Success Criteria

All tests should pass with:

- ✅ Correct HTTP status codes
- ✅ Proper response format
- ✅ Role-based access working
- ✅ Validation working
- ✅ Pagination working
- ✅ Reports generating correctly
- ✅ Complete workflows functioning

---

**Happy Testing!** 🎉
