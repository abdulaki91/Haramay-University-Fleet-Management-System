# Use Case Implementation Status

This document maps the use case diagram requirements to the current system implementation.

---

## Actors and Their Use Cases

### 1. System Admin

| Use Case               | Implementation Status | Notes                   |
| ---------------------- | --------------------- | ----------------------- |
| Create user account    | ✅ Implemented        | `/api/users` POST       |
| Update user account    | ✅ Implemented        | `/api/users/:id` PUT    |
| Delete user account    | ✅ Implemented        | `/api/users/:id` DELETE |
| Generate report        | ✅ Implemented        | `/api/reports/system`   |
| View scheduled vehicle | ✅ Implemented        | `/api/schedules` GET    |
| Login                  | ✅ Implemented        | `/api/auth/login`       |

**Status**: ✅ All use cases implemented

---

### 2. Security Guard

| Use Case             | Implementation Status | Notes                             |
| -------------------- | --------------------- | --------------------------------- |
| View exit permission | ✅ Implemented        | `/api/exit-requests/approved` GET |
| Login                | ✅ Implemented        | `/api/auth/login`                 |

**Status**: ✅ All use cases implemented

---

### 3. Driver

| Use Case                   | Implementation Status | Notes                                        |
| -------------------------- | --------------------- | -------------------------------------------- |
| View scheduled vehicle     | ✅ Implemented        | `/api/schedules` GET (filtered by driver_id) |
| Request for exit           | ✅ Implemented        | `/api/exit-requests` POST                    |
| Request maintenance record | ✅ Implemented        | `/api/maintenance` POST                      |
| Login                      | ✅ Implemented        | `/api/auth/login`                            |

**Status**: ✅ All use cases implemented

**Note**: Driver previously had fuel record access - now removed per use case requirements

---

### 4. Mechanic

| Use Case                 | Implementation Status | Notes                  |
| ------------------------ | --------------------- | ---------------------- |
| View request maintenance | ✅ Implemented        | `/api/maintenance` GET |
| Login                    | ✅ Implemented        | `/api/auth/login`      |

**Status**: ✅ All use cases implemented

---

### 5. Scheduler

| Use Case                 | Implementation Status | Notes                             |
| ------------------------ | --------------------- | --------------------------------- |
| View scheduled vehicle   | ✅ Implemented        | `/api/schedules` GET              |
| Prepare vehicle schedule | ✅ Implemented        | `/api/schedules` POST             |
| Search vehicle info      | ✅ Implemented        | `/api/vehicles/search/:query` GET |
| Login                    | ✅ Implemented        | `/api/auth/login`                 |

**Status**: ✅ All use cases implemented

---

### 6. Vehicle Manager

| Use Case                 | Implementation Status | Notes                                                                     |
| ------------------------ | --------------------- | ------------------------------------------------------------------------- |
| Calculate fuel balance   | ✅ Implemented        | `/api/fuel/vehicle/:id/balance` GET                                       |
| Search vehicle info      | ✅ Implemented        | `/api/vehicles/search/:query` GET                                         |
| Vehicle registration     | ✅ Implemented        | `/api/vehicles` POST                                                      |
| Update vehicle record    | ✅ Implemented        | `/api/vehicles/:id` PUT                                                   |
| Generate report          | ✅ Implemented        | `/api/reports/vehicles`, `/api/reports/fuel`, `/api/reports/maintenance`  |
| View request maintenance | ✅ Implemented        | `/api/maintenance` GET                                                    |
| Notify exit permission   | ✅ Implemented        | `/api/exit-requests/:id/approve` PUT, `/api/exit-requests/:id/reject` PUT |
| View exit request        | ✅ Implemented        | `/api/exit-requests` GET                                                  |
| Login                    | ✅ Implemented        | `/api/auth/login`                                                         |

**Status**: ✅ All use cases implemented

---

### 7. User

| Use Case               | Implementation Status | Notes                            |
| ---------------------- | --------------------- | -------------------------------- |
| View scheduled vehicle | ✅ Implemented        | `/api/schedules` GET (read-only) |
| Login                  | ✅ Implemented        | `/api/auth/login`                |

**Status**: ✅ All use cases implemented

---

## Implementation Summary

### ✅ Fully Implemented (7/7 actors)

All actors and their use cases from the use case diagram are fully implemented in the system.

### Recent Changes Made

1. **Removed Driver fuel record access** - Driver can no longer add or view fuel records
2. **Updated documentation** - ROLE_PERMISSIONS.md and SYSTEM_WORKFLOW.md updated
3. **Updated routes** - Removed "driver" from fuel routes authorization
4. **Updated frontend** - Removed fuel navigation from driver sidebar

### System Alignment

The system now perfectly aligns with the use case diagram requirements:

- ✅ All 7 actors implemented
- ✅ All use cases mapped to API endpoints
- ✅ Role-based access control enforced
- ✅ Frontend navigation matches permissions
- ✅ Documentation updated

---

## API Endpoint Mapping

### Authentication

- `POST /api/auth/login` - All actors

### User Management (System Admin)

- `POST /api/users` - Create user account
- `PUT /api/users/:id` - Update user account
- `DELETE /api/users/:id` - Delete user account
- `GET /api/users` - View users

### Vehicle Management

- `POST /api/vehicles` - Vehicle registration (Vehicle Manager)
- `PUT /api/vehicles/:id` - Update vehicle record (Vehicle Manager)
- `GET /api/vehicles/search/:query` - Search vehicle info (Scheduler, Vehicle Manager)
- `GET /api/vehicles` - View vehicles (All roles)

### Schedule Management

- `POST /api/schedules` - Prepare vehicle schedule (Scheduler)
- `GET /api/schedules` - View scheduled vehicle (Admin, Scheduler, Driver, User)
- `PUT /api/schedules/:id` - Update schedule (Scheduler)
- `DELETE /api/schedules/:id` - Delete schedule (Scheduler)

### Fuel Management

- `POST /api/fuel` - Add fuel record (Vehicle Manager)
- `GET /api/fuel/vehicle/:id/balance` - Calculate fuel balance (Vehicle Manager)
- `GET /api/fuel` - View fuel records (Vehicle Manager)

### Maintenance Management

- `POST /api/maintenance` - Request maintenance record (Driver)
- `GET /api/maintenance` - View request maintenance (Mechanic, Vehicle Manager)
- `PUT /api/maintenance/:id/status` - Update maintenance (Mechanic, Vehicle Manager)

### Exit Request Management

- `POST /api/exit-requests` - Request for exit (Driver)
- `GET /api/exit-requests` - View exit request (Vehicle Manager)
- `PUT /api/exit-requests/:id/approve` - Notify exit permission - approve (Vehicle Manager)
- `PUT /api/exit-requests/:id/reject` - Notify exit permission - reject (Vehicle Manager)
- `GET /api/exit-requests/approved` - View exit permission (Security Guard)

### Reports

- `GET /api/reports/system` - Generate system report (Admin)
- `GET /api/reports/vehicles` - Generate vehicle report (Admin, Vehicle Manager)
- `GET /api/reports/fuel` - Generate fuel report (Admin, Vehicle Manager)
- `GET /api/reports/maintenance` - Generate maintenance report (Admin, Vehicle Manager)

---

## Compliance Status

✅ **100% Compliant** with use case diagram requirements

All actors, use cases, and relationships from the diagram are implemented and enforced in the system.

---

**Last Updated**: March 2, 2026
**Version**: 1.0
