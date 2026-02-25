# Role-Based Permissions - Haramaya Fleet Management System

## Overview

This document details the exact permissions for each user role in the system.

---

## 1. Admin (System Administrator)

### Permissions

- ✓ Create user account
- ✓ Update user account
- ✓ Delete user account
- ✓ Assign roles to users
- ✓ View all users
- ✓ View scheduled vehicles
- ✓ Generate system reports
- ✓ View all system statistics

### API Access

- Full access to `/api/users/*`
- Read access to `/api/schedules/*`
- Full access to `/api/reports/system`
- Access to vehicle, maintenance, and fuel reports

### Use Cases

- System administration
- User management
- System monitoring
- Report generation

---

## 2. Vehicle Manager

### Permissions

- ✓ Register vehicle
- ✓ Update vehicle record
- ✓ Search vehicle information
- ✓ Calculate fuel balance
- ✓ View maintenance requests
- ✓ Approve/reject exit permission requests
- ✓ Notify exit permission decisions
- ✓ Generate reports (vehicle, maintenance, fuel)
- ✓ View all fuel records
- ✓ Add fuel records

### API Access

- Full access to `/api/vehicles/*`
- Full access to `/api/fuel/*`
- Read access to `/api/maintenance/*`
- Update access to `/api/maintenance/*/status`
- Full access to `/api/exit-requests/*` (except approved-only view)
- Access to `/api/reports/vehicles`, `/api/reports/maintenance`, `/api/reports/fuel`

### Use Cases

- Vehicle fleet management
- Fuel consumption monitoring
- Maintenance oversight
- Exit permission approval
- Report generation

---

## 3. Scheduler

### Permissions

- ✓ Prepare vehicle schedule
- ✓ Update vehicle schedule
- ✓ Delete vehicle schedule
- ✓ Search vehicle information
- ✓ View scheduled vehicles

### API Access

- Full access to `/api/schedules/*`
- Search access to `/api/vehicles/search/*`
- Read access to `/api/vehicles/*`

### Use Cases

- Schedule creation and management
- Vehicle availability checking
- Schedule coordination

---

## 4. Driver

### Permissions

- ✓ View scheduled vehicles
- ✓ Request exit permission
- ✓ Request maintenance record
- ✓ Add fuel records

### API Access

- Read access to `/api/schedules/*`
- Create access to `/api/exit-requests`
- Create access to `/api/maintenance`
- Create access to `/api/fuel`

### Use Cases

- View assigned schedules
- Request vehicle exit permissions
- Report maintenance issues
- Record fuel consumption

---

## 5. Mechanic

### Permissions

- ✓ View maintenance requests
- ✓ Update maintenance status
- ✓ Assign maintenance tasks
- ✓ Update maintenance costs

### API Access

- Read access to `/api/maintenance/*`
- Update access to `/api/maintenance/*/status`

### Use Cases

- View pending maintenance
- Update maintenance progress
- Complete maintenance tasks
- Track maintenance costs

---

## 6. User (Basic User)

### Permissions

- ✓ View scheduled vehicles only

### API Access

- Read access to `/api/schedules/*`

### Use Cases

- Check vehicle schedules
- View availability

---

## 7. Security Guard

### Permissions

- ✓ View approved exit permissions only

### API Access

- Read access to `/api/exit-requests/approved`
- Read access to `/api/exit-requests/:id` (approved only)

### Use Cases

- Verify approved exit requests
- Gate control
- Vehicle exit monitoring

---

## Permission Matrix

| Feature                | Admin | Vehicle Manager | Scheduler | Driver | Mechanic | User | Security Guard |
| ---------------------- | ----- | --------------- | --------- | ------ | -------- | ---- | -------------- |
| **User Management**    |
| Create User            | ✓     | ✗               | ✗         | ✗      | ✗        | ✗    | ✗              |
| Update User            | ✓     | ✗               | ✗         | ✗      | ✗        | ✗    | ✗              |
| Delete User            | ✓     | ✗               | ✗         | ✗      | ✗        | ✗    | ✗              |
| Assign Role            | ✓     | ✗               | ✗         | ✗      | ✗        | ✗    | ✗              |
| View Users             | ✓     | ✗               | ✗         | ✗      | ✗        | ✗    | ✗              |
| **Vehicle Management** |
| Register Vehicle       | ✗     | ✓               | ✗         | ✗      | ✗        | ✗    | ✗              |
| Update Vehicle         | ✗     | ✓               | ✗         | ✗      | ✗        | ✗    | ✗              |
| View Vehicles          | ✓     | ✓               | ✓         | ✓      | ✓        | ✓    | ✓              |
| Search Vehicles        | ✗     | ✓               | ✓         | ✗      | ✗        | ✗    | ✗              |
| Update Status          | ✗     | ✓               | ✗         | ✗      | ✗        | ✗    | ✗              |
| **Fuel Management**    |
| Add Fuel Record        | ✗     | ✓               | ✗         | ✓      | ✗        | ✗    | ✗              |
| View Fuel Records      | ✗     | ✓               | ✗         | ✗      | ✗        | ✗    | ✗              |
| Calculate Balance      | ✗     | ✓               | ✗         | ✗      | ✗        | ✗    | ✗              |
| Calculate Consumption  | ✗     | ✓               | ✗         | ✗      | ✗        | ✗    | ✗              |
| **Maintenance**        |
| Create Request         | ✗     | ✗               | ✗         | ✓      | ✗        | ✗    | ✗              |
| View Requests          | ✗     | ✓               | ✗         | ✗      | ✓        | ✗    | ✗              |
| Update Status          | ✗     | ✓               | ✗         | ✗      | ✓        | ✗    | ✗              |
| **Scheduling**         |
| Create Schedule        | ✗     | ✗               | ✓         | ✗      | ✗        | ✗    | ✗              |
| Update Schedule        | ✗     | ✗               | ✓         | ✗      | ✗        | ✗    | ✗              |
| Delete Schedule        | ✗     | ✗               | ✓         | ✗      | ✗        | ✗    | ✗              |
| View Schedules         | ✓     | ✗               | ✓         | ✓      | ✗        | ✓    | ✗              |
| **Exit Requests**      |
| Create Request         | ✗     | ✗               | ✗         | ✓      | ✗        | ✗    | ✗              |
| View All Requests      | ✗     | ✓               | ✗         | ✗      | ✗        | ✗    | ✗              |
| Approve Request        | ✗     | ✓               | ✗         | ✗      | ✗        | ✗    | ✗              |
| Reject Request         | ✗     | ✓               | ✗         | ✗      | ✗        | ✗    | ✗              |
| View Approved Only     | ✗     | ✗               | ✗         | ✗      | ✗        | ✗    | ✓              |
| **Reports**            |
| Vehicle Report         | ✓     | ✓               | ✗         | ✗      | ✗        | ✗    | ✗              |
| Maintenance Report     | ✓     | ✓               | ✗         | ✗      | ✗        | ✗    | ✗              |
| Fuel Report            | ✓     | ✓               | ✗         | ✗      | ✗        | ✗    | ✗              |
| System Report          | ✓     | ✗               | ✗         | ✗      | ✗        | ✗    | ✗              |

---

## Workflow Examples

### 1. Vehicle Maintenance Workflow

1. **Driver** creates maintenance request
2. **Vehicle Manager** or **Mechanic** views the request
3. **Mechanic** updates status to "in_progress"
4. **Mechanic** completes work and updates status to "completed"
5. **Vehicle Manager** reviews and generates maintenance report

### 2. Exit Permission Workflow

1. **Driver** creates exit request
2. **Vehicle Manager** reviews the request
3. **Vehicle Manager** approves or rejects with reason
4. **Security Guard** views approved requests at gate
5. **Security Guard** allows vehicle exit

### 3. Schedule Management Workflow

1. **Scheduler** creates vehicle schedule
2. **Driver** views assigned schedule
3. **User** views schedule for planning
4. **Admin** monitors all schedules
5. **Scheduler** updates or cancels as needed

### 4. Fuel Management Workflow

1. **Driver** adds fuel record after refueling
2. **Vehicle Manager** views fuel history
3. **Vehicle Manager** calculates fuel balance
4. **Vehicle Manager** generates fuel usage report
5. **Admin** reviews overall fuel consumption

---

## Security Notes

1. All endpoints require valid JWT authentication
2. Role-based middleware enforces permissions
3. Users can only access resources allowed by their role
4. Attempting unauthorized access returns 403 Forbidden
5. Invalid tokens return 401 Unauthorized
6. Inactive accounts are automatically blocked

---

## Role Assignment

Only **Admin** users can assign or change user roles through:

```http
PUT /api/users/:id/role
Authorization: Bearer <admin_token>

{
  "role_id": 2
}
```

Role IDs:

1. admin
2. vehicle_manager
3. scheduler
4. driver
5. mechanic
6. user
7. security_guard
