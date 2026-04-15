# Haramaya University Fleet Management System - Setup Guide (Windows 11)

## Quick Start (3 Steps)

### Step 1: Start MySQL Server

1. Open XAMPP Control Panel
2. Click Start button next to MySQL
3. Wait for it to show "MySQL running on port 3306"

### Step 2: Start Backend Server

1. Open Command Prompt or PowerShell
2. Navigate to the api folder: cd api
3. Run the command: npm start
4. Wait for these messages to appear:
   - ✓ Server running on port 3000
   - ✓ Database connected
   - ✓ Notification cron jobs initialized

### Step 3: Start Frontend Server

1. Open a new Command Prompt or PowerShell window
2. Navigate to the Frontend folder: cd Frontend
3. Run the command: npm run dev
4. Wait for the message showing: Local: http://localhost:5173/
5. Open your browser and go to: http://localhost:8080

---

## Access Points

• Frontend: http://localhost:5173
• Backend API: http://localhost:3000/api
• MySQL: localhost:3306

---

## Default Test Credentials

System Admin
• Email: admin@haramaya.edu.et
• Password: Admin@123456

Vehicle Manager
• Email: manager@haramaya.edu.et
• Password: Manager@123456

Scheduler
• Email: scheduler@haramaya.edu.et
• Password: Scheduler@123456

Driver 1
• Email: driver1@haramaya.edu.et
• Password: Driver@123456

Driver 2
• Email: driver2@haramaya.edu.et
• Password: Driver@123456

Mechanic
• Email: mechanic@haramaya.edu.et
• Password: Mechanic@123456

Security Guard
• Email: security@haramaya.edu.et
• Password: Security@123456

---

## User Roles & Workflows

### System Admin

• Manages all users and system settings
• Can view all data and reports
• Can send emergency alerts
• Can receive emergency alerts

### Vehicle Manager

• Manages vehicles, fuel records, and maintenance
• Creates and assigns schedules
• Can send emergency fuel alerts via Fuel Balance page
• Can receive emergency alerts from drivers
• Primary responder for driver emergencies

### Scheduler

• Creates and manages vehicle schedules
• Assigns drivers to vehicles
• Cannot send or receive emergency alerts

### Driver

• Views assigned schedules
• Requests maintenance
• Requests exit from campus
• Sends emergency alerts via dedicated Emergency Alert page
• Cannot receive emergency alerts

### Mechanic

• Handles maintenance requests
• Updates maintenance status
• Cannot send or receive emergency alerts

### Security Guard

• Monitors and approves exit requests
• Can receive emergency alerts
• Cannot send emergency alerts

---

## Key Features

### Emergency Alert System

Who Sends:
• Drivers: Use Emergency Alert page when stranded or need urgent help
• Vehicle Managers: Use emergency button in Fuel Balance page for fuel emergencies

Who Receives & Responds:
• Vehicle Managers: Primary responders (coordinate rescue/fuel delivery)
• System Admins: Secondary responders (system-wide oversight)
• Security Guards: Safety coordination

### Notification System

• Real-time bell notifications in header
• Email notifications (configured with Gmail)
• Automatic fuel level monitoring
• Maintenance request tracking
• Exit request status updates
• Schedule assignment notifications

### Fuel Monitoring

• Track fuel consumption per vehicle
• Automatic low fuel alerts
• Emergency fuel alert system
• Fuel cost tracking and reports

### Maintenance Management

• Driver can request maintenance
• Mechanic receives and updates status
• Automatic notifications on status changes
• Maintenance history tracking

### Exit Workflow

• Driver requests exit from campus
• Security guard approves or rejects
• Real-time notifications
• Exit history tracking

---

## Testing Workflows

### Test 1: Driver Emergency Alert

1. Login as Driver (driver1@haramaya.edu.et)
2. Go to Emergency Alert in navigation menu
3. Select a vehicle
4. Enter location
5. Click SEND EMERGENCY ALERT
6. Login as Vehicle Manager to see notification

### Test 2: Vehicle Manager Emergency Alert

1. Login as Vehicle Manager (manager@haramaya.edu.et)
2. Go to Fuel page
3. Click Emergency Fuel Alert button
4. Select vehicle and location
5. Click Send Emergency Alert
6. Check notifications

### Test 3: Fuel Monitoring

1. Login as Vehicle Manager
2. Go to Fuel page
3. Click Add Fuel Record
4. Fill in fuel details
5. Submit
6. Check for low fuel alerts

### Test 4: Maintenance Request

1. Login as Driver
2. Go to Maintenance page
3. Click Request Maintenance
4. Describe the issue
5. Submit
6. Login as Mechanic to see request

### Test 5: Exit Request

1. Login as Driver
2. Go to Exit page
3. Click Request Exit
4. Fill in details
5. Submit
6. Login as Security Guard to approve or reject

---

## Troubleshooting

### MySQL Not Starting in XAMPP

1. Make sure XAMPP is running as Administrator
2. Right-click XAMPP Control Panel
3. Select Run as Administrator
4. Click Start next to MySQL again

### Port 3000 Already in Use

1. Open PowerShell as Administrator
2. Run: netstat -ano | findstr :3000
3. Note the PID number shown
4. Run: taskkill /PID [PID] /F
5. Try npm start again

### Port 5173 Already in Use

1. Run: npm run dev -- --port 5174
2. Open browser to http://localhost:5174

### Frontend Not Loading

1. Clear browser cache (Ctrl+Shift+Delete)
2. Verify backend is running on port 3000
3. Check browser console for errors (Press F12)

### Notifications Not Working

1. Verify backend is running
2. Check browser console for errors (Press F12)
3. Check Network tab for socket connection

### Database Connection Failed

1. Verify MySQL is running in XAMPP
2. Check that database haramaya_fleet exists
3. Verify .env file has correct database credentials

---

## Project Structure

api folder (Backend)
• config: Database configuration
• controllers: API endpoints
• models: Database models
• routes: API routes
• services: Business logic
• middlewares: Authentication and validation
• .env: Environment variables
• server.js: Main server file

Frontend folder (Frontend)
• src/pages: Page components
• src/components: Reusable components
• src/api/services: API calls
• src/store: State management
• src/App.tsx: Main app
• .env: Environment variables
• package.json: Dependencies

---

## Summary

The project is ready to run. Just follow these steps:

1. Start MySQL in XAMPP Control Panel
2. Run backend: npm start in api folder
3. Run frontend: npm run dev in Frontend folder
4. Open browser: http://localhost:5173

Login with any of the default credentials above and start testing!

Keep both Command Prompt windows open while using the application.
