# Haramaya Fleet Management System - Complete Flow

## System Overview

The system manages university vehicle operations with role-based access control.

## User Roles

1. **System Admin** - Full access, user management
2. **Vehicle Manager** - Vehicle registration, exit approval, reports
3. **Scheduler** - Creates vehicle schedules
4. **Driver** - Requests exit permission and maintenance
5. **Mechanic** - Views and handles maintenance requests
6. **Security Guard** - Views approved exit permissions
7. **User** - Views scheduled vehicles

---

## Core Workflows

### 1. Vehicle Registration Flow

**Actor:** Vehicle Manager

**Steps:**

1. Vehicle Manager logs in
2. Navigates to "Vehicle Management"
3. Clicks "Register Vehicle"
4. Fills form:
   - Plate Number (unique)
   - Make, Model, Year
   - Type (bus, van, pickup, sedan, truck)
   - Fuel Type (diesel, gasoline, electric)
   - Mileage
5. Submits form
6. Backend validates and saves to database
7. Real-time notification sent to all connected users
8. Vehicle appears in vehicle list with status "available"

**Database:** `vehicles` table

---

### 2. Schedule Creation Flow

**Actor:** Scheduler

**Steps:**

1. Scheduler logs in
2. Navigates to "Schedules"
3. Clicks "Create Schedule"
4. Selects:
   - Vehicle (only available vehicles shown)
   - Destination
   - Purpose
   - Departure date/time
   - Return date/time
   - Number of passengers
5. Submits schedule
6. Backend creates schedule with status "pending"
7. Real-time notification sent via Socket.IO
8. Schedule appears in schedules list

**Database:** `schedules` table
**Real-time Event:** `schedule:created`

---

### 3. Exit Request Workflow (Most Complex)

**Actors:** Driver → Vehicle Manager → Security Guard

#### Phase 1: Driver Requests Exit

**Steps:**

1. Driver logs in
2. Navigates to "Exit Workflow"
3. Clicks "Request Exit"
4. Fills form:
   - Selects vehicle
   - Selects schedule
   - Provides reason
5. Submits request
6. Backend creates exit request with status "pending"
7. Real-time notification sent to Vehicle Managers
8. Driver sees request in their list

**Database:** `exit_requests` table (status: pending)
**Real-time Event:** `exit_request:created`

#### Phase 2: Vehicle Manager Reviews

**Steps:**

1. Vehicle Manager receives real-time notification
2. Sees new request in "Exit Work

### 1. Vehicle Registration Flow

- Vehicle Manager registers new vehicle
- System validates plate number (unique)
- Vehicle saved with status "available"
- Real-time update to all users

### 2. Schedule Creation Flow

- Scheduler creates schedule for available vehicle
- Assigns destination, dates, purpose
- Status starts as "pending"
- Real-time notification sent

### 3. Exit Request Workflow

**Driver → Vehicle Manager → Security Guard**

A. Driver requests exit permission
B. Vehicle Manager approves/rejects
C. Security Guard sees approved exits only
D. Real-time notifications at each step

### 4. Maintenance Request Flow

- Driver submits maintenance request
- Selects vehicle, type, priority, description
- Mechanic receives notification
- Mechanic updates status (pending → in_progress → completed)
- Real-time updates throughout

### 5. Fuel Tracking Flow

- Fuel records added to system
- Tracks: liters, cost, odometer, station
- Vehicle Manager views fuel balance
- Reports show total cost and consumption

---

## Technical Flow

### Authentication Flow

1. User enters email/password
2. Backend validates credentials
3. JWT token generated and returned
4. Token stored in frontend (Zustand store)
5. Token sent with every API request
6. Socket.IO connection authenticated with JWT

### Real-Time Communication

1. User logs in → Socket connects
2. User joins role-based rooms
3. Actions trigger socket events
4. Connected users receive instant updates
5. UI updates without page refresh

### Data Transformation Flow

1. Frontend sends camelCase data
2. Backend transformer converts to snake_case
3. Database stores in snake_case
4. Backend reads from database
5. Transformer converts to camelCase
6. Frontend receives camelCase data

---

## Complete Exit Request Example

### Step-by-Step Flow

**1. Driver Creates Request**

```
Driver → Frontend → POST /api/exit-requests
{
  vehicleId: "1",
  scheduleId: "5",
  reason: "Official trip to Dire Dawa"
}
```

**2. Backend Processing**

- Validates driver has permission
- Transforms data to snake_case
- Inserts into exit_requests table
- Emits socket event: `exit_request:created`

**3. Real-Time Notification**

- Socket.IO broadcasts to "vehicle_manager" room
- Vehicle Managers see instant notification
- Request appears in their exit workflow page

**4. Vehicle Manager Approves**

```
Manager → Frontend → PUT /api/exit-requests/:id
{
  status: "approved",
  approvedBy: "manager_id"
}
```


**5. Backend Updates**
- Updates exit_requests table
- Sets status = "approved"
- Records approved_by and approved_at
- Emits: `exit_request:approved`

**6. Real-Time Updates**
- Driver receives notification
- Security Guard sees approved request
- UI updates automatically

**7. Security Guard Verification**
- Guard sees only approved exits
- Verifies vehicle can leave campus
- Checks against schedule

---

## Database Relationships

```
roles (1) ←→ (many) users
users (1) ←→ (many) schedules (as driver)
users (1) ←→ (many) exit_requests (as driver)
users (1) ←→ (many) maintenance_requests (as requester)

vehicles (1) ←→ (many) schedules
vehicles (1) ←→ (many) exit_requests
vehicles (