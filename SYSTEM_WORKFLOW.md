# Haramaya Fleet Management System - Actor Workflow Guide

## Overview

This document defines the complete workflow of the Haramaya Fleet Management System, detailing which actors perform what actions and when. The system manages vehicle fleet operations through role-based access control with 7 distinct user roles.

---

## System Actors

### 1. **Admin** (System Administrator)

- **Primary Role**: System oversight and user management
- **Access Level**: Highest - can manage users and view all system data

### 2. **Vehicle Manager**

- **Primary Role**: Fleet operations and resource management
- **Access Level**: High - manages vehicles, fuel, maintenance approvals

### 3. **Scheduler**

- **Primary Role**: Vehicle scheduling and coordination
- **Access Level**: Medium - creates and manages vehicle schedules

### 4. **Driver**

- **Primary Role**: Vehicle operation and service requests
- **Access Level**: Limited - views schedules, requests services

### 5. **Mechanic**

- **Primary Role**: Vehicle maintenance and repairs
- **Access Level**: Limited - manages maintenance tasks

### 6. **User** (Basic User)

- **Primary Role**: Schedule viewing for planning
- **Access Level**: Minimal - read-only schedule access

### 7. **Security Guard**

- **Primary Role**: Gate control and exit verification
- **Access Level**: Minimal - views approved exit requests only

---

## Core System Workflows

### 1. Vehicle Registration & Management Workflow

#### **Initial Setup** (Admin → Vehicle Manager)

```
1. Admin creates Vehicle Manager account
   ↓
2. Vehicle Manager logs into system
   ↓
3. Vehicle Manager registers new vehicles
   ↓
4. System assigns unique vehicle IDs
   ↓
5. Vehicles become available for scheduling
```

**Actors & Actions:**

- **Admin**: Creates user accounts, assigns Vehicle Manager role
- **Vehicle Manager**: Registers vehicles, updates vehicle information, manages vehicle status

---

### 2. User Management Workflow

#### **User Onboarding** (Admin-driven)

```
1. Admin receives user registration request
   ↓
2. Admin creates user account with appropriate role
   ↓
3. Admin provides login credentials to user
   ↓
4. User logs in and changes default password
   ↓
5. User gains access based on assigned role
```

**Actors & Actions:**

- **Admin**: Creates accounts, assigns roles, manages user permissions
- **All Users**: Change passwords, access role-appropriate features

---

### 3. Vehicle Scheduling Workflow

#### **Schedule Creation & Management** (Scheduler-driven)

```
1. Scheduler receives scheduling request
   ↓
2. Scheduler searches available vehicles
   ↓
3. Scheduler creates schedule with:
   - Vehicle assignment
   - Driver assignment
   - Trip details (destination, purpose, dates)
   ↓
4. System validates schedule conflicts
   ↓
5. Schedule becomes visible to relevant users
```

**Actors & Actions:**

- **Scheduler**: Creates, updates, deletes schedules
- **Driver**: Views assigned schedules
- **User**: Views schedules for planning
- **Admin**: Monitors all scheduling activity

---

### 4. Exit Permission Workflow

#### **Vehicle Exit Process** (Driver → Vehicle Manager → Security Guard)

```
1. Driver needs to take vehicle out
   ↓
2. Driver creates exit request with:
   - Vehicle ID
   - Schedule reference
   - Destination & purpose
   - Expected return time
   ↓
3. Vehicle Manager reviews request
   ↓
4. Vehicle Manager approves/rejects with reason
   ↓
5. If approved: Security Guard sees approved request
   ↓
6. Security Guard verifies and allows vehicle exit
   ↓
7. Driver returns and updates status (optional)
```

**Actors & Actions:**

- **Driver**: Creates exit requests
- **Vehicle Manager**: Reviews and approves/rejects requests
- **Security Guard**: Verifies approved requests at gate

---

### 5. Maintenance Management Workflow

#### **Maintenance Request Process** (Driver → Mechanic → Vehicle Manager)

```
1. Driver identifies maintenance need
   ↓
2. Driver creates maintenance request with:
   - Vehicle ID
   - Issue description
   - Priority level
   - Notes
   ↓
3. Mechanic views pending requests
   ↓
4. Mechanic updates status to "in_progress"
   ↓
5. Mechanic performs maintenance work
   ↓
6. Mechanic updates status to "completed" with costs
   ↓
7. Vehicle Manager reviews completed work
   ↓
8. Vehicle status updated to "available"
```

**Actors & Actions:**

- **Driver**: Reports maintenance issues
- **Mechanic**: Updates maintenance status, performs repairs
- **Vehicle Manager**: Oversees maintenance, approves completion

---

### 6. Fuel Management Workflow

#### **Fuel Tracking Process** (Driver/Vehicle Manager-driven)

```
1. Vehicle needs refueling
   ↓
2. Driver or Vehicle Manager adds fuel record:
   - Fuel amount
   - Cost
   - Odometer reading
   - Station details
   ↓
3. System calculates fuel consumption
   ↓
4. Vehicle Manager monitors fuel usage
   ↓
5. Vehicle Manager generates fuel reports
```

**Actors & Actions:**

- **Driver**: Can add fuel records during trips
- **Vehicle Manager**: Manages fuel records, monitors consumption, generates reports

---

### 7. Reporting & Analytics Workflow

#### **Report Generation Process** (Admin/Vehicle Manager-driven)

```
1. Admin or Vehicle Manager needs system insights
   ↓
2. User generates appropriate report:
   - Vehicle utilization
   - Maintenance costs
   - Fuel consumption
   - System statistics
   ↓
3. System compiles real-time data
   ↓
4. Report displayed with charts and summaries
   ↓
5. Data used for decision making
```

**Actors & Actions:**

- **Admin**: Generates system-wide reports
- **Vehicle Manager**: Generates operational reports

---

## Daily Operational Workflows

### **Morning Operations**

```
1. Security Guard checks approved exit requests
2. Drivers check their daily schedules
3. Mechanics review pending maintenance requests
4. Vehicle Manager monitors vehicle status
```

### **During Operations**

```
1. Drivers request exit permissions as needed
2. Vehicle Manager approves/rejects requests
3. Mechanics update maintenance progress
4. Scheduler adjusts schedules if needed
```

### **Evening Operations**

```
1. Drivers return vehicles and update status
2. Vehicle Manager reviews day's activities
3. Fuel records added for any refueling
4. Maintenance requests created for issues found
```

---

## Emergency Workflows

### **Vehicle Breakdown Process**

```
1. Driver identifies breakdown
   ↓
2. Driver creates CRITICAL maintenance request
   ↓
3. Vehicle Manager immediately notified
   ↓
4. Mechanic assigned with high priority
   ↓
5. Scheduler adjusts affected schedules
   ↓
6. Alternative vehicle arranged if needed
```

### **Urgent Schedule Changes**

```
1. Schedule change needed
   ↓
2. Scheduler updates schedule
   ↓
3. Affected drivers notified
   ↓
4. Exit permissions updated if needed
   ↓
5. Vehicle Manager informed of changes
```

---

## System Integration Points

### **Real-time Notifications**

- Exit request approvals/rejections
- Maintenance status updates
- Schedule changes
- System alerts

### **Data Flow**

```
User Actions → API Endpoints → Database → Real-time Updates → UI Refresh
```

### **Security Checkpoints**

- JWT token validation on all requests
- Role-based permission checks
- Action logging for audit trails

---

## Workflow Optimization Guidelines

### **For Schedulers**

- Check vehicle availability before creating schedules
- Coordinate with Vehicle Manager for maintenance windows
- Plan buffer time for unexpected delays

### **For Vehicle Managers**

- Review exit requests promptly to avoid delays
- Monitor fuel consumption patterns
- Schedule preventive maintenance proactively

### **For Drivers**

- Submit exit requests early
- Report maintenance issues immediately
- Keep accurate fuel and mileage records

### **For Mechanics**

- Update maintenance status regularly
- Provide accurate cost estimates
- Prioritize critical safety issues

---

## Success Metrics

### **Operational Efficiency**

- Average exit request approval time
- Vehicle utilization rates
- Maintenance response times
- Schedule adherence rates

### **System Usage**

- User login frequency
- Feature adoption rates
- Error rates by role
- Report generation frequency

---

## Troubleshooting Common Workflow Issues

### **Exit Request Delays**

- **Cause**: Vehicle Manager not reviewing requests
- **Solution**: Set up notification alerts, delegate approval authority

### **Schedule Conflicts**

- **Cause**: Double-booking vehicles
- **Solution**: Real-time availability checking, better coordination

### **Maintenance Backlogs**

- **Cause**: Insufficient mechanic capacity
- **Solution**: Priority-based assignment, external contractor integration

### **Fuel Tracking Gaps**

- **Cause**: Missing fuel records
- **Solution**: Mandatory fuel logging, automated reminders

---

This workflow guide ensures all actors understand their responsibilities and the system operates efficiently with clear accountability at each step.
