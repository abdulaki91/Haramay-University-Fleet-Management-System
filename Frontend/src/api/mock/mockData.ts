import type { Vehicle, Schedule, FuelRecord, ExitRequest, MaintenanceRequest, User } from "@/types";

export const mockVehicles: Vehicle[] = [
  { id: "v1", plateNumber: "AA-12345", model: "Coaster", make: "Toyota", year: 2020, type: "bus", status: "available", fuelType: "diesel", mileage: 45000, registeredAt: "2020-03-15" },
  { id: "v2", plateNumber: "AA-67890", model: "Hilux", make: "Toyota", year: 2021, type: "pickup", status: "in_use", fuelType: "diesel", mileage: 32000, registeredAt: "2021-06-10" },
  { id: "v3", plateNumber: "AA-11223", model: "HiAce", make: "Toyota", year: 2019, type: "van", status: "maintenance", fuelType: "diesel", mileage: 67000, registeredAt: "2019-01-20" },
  { id: "v4", plateNumber: "AA-44556", model: "Corolla", make: "Toyota", year: 2022, type: "sedan", status: "available", fuelType: "gasoline", mileage: 12000, registeredAt: "2022-09-05" },
  { id: "v5", plateNumber: "AA-78901", model: "FH", make: "Volvo", year: 2018, type: "truck", status: "available", fuelType: "diesel", mileage: 98000, registeredAt: "2018-11-30" },
];

export const mockSchedules: Schedule[] = [
  { id: "s1", vehicleId: "v1", driverId: "3", destination: "Dire Dawa", departureTime: "2026-02-26T08:00:00", returnTime: "2026-02-26T18:00:00", status: "approved", purpose: "Staff transport", passengers: 25, createdAt: "2026-02-20" },
  { id: "s2", vehicleId: "v2", driverId: "3", destination: "Harar City", departureTime: "2026-02-27T07:00:00", returnTime: "2026-02-27T12:00:00", status: "pending", purpose: "Supply pickup", passengers: 2, createdAt: "2026-02-21" },
  { id: "s3", vehicleId: "v4", driverId: "3", destination: "Addis Ababa", departureTime: "2026-03-01T06:00:00", returnTime: "2026-03-02T20:00:00", status: "pending", purpose: "Conference", passengers: 4, createdAt: "2026-02-22" },
];

export const mockFuelRecords: FuelRecord[] = [
  { id: "f1", vehicleId: "v1", driverId: "3", liters: 80, costPerLiter: 72.5, totalCost: 5800, odometerReading: 45000, fueledAt: "2026-02-20", station: "Total Haramaya" },
  { id: "f2", vehicleId: "v2", driverId: "3", liters: 60, costPerLiter: 72.5, totalCost: 4350, odometerReading: 32000, fueledAt: "2026-02-18", station: "NOC Campus" },
  { id: "f3", vehicleId: "v5", driverId: "3", liters: 120, costPerLiter: 72.5, totalCost: 8700, odometerReading: 98000, fueledAt: "2026-02-15", station: "Total Haramaya" },
];

export const mockExitRequests: ExitRequest[] = [
  { id: "e1", vehicleId: "v1", driverId: "3", scheduleId: "s1", reason: "Scheduled staff transport to Dire Dawa", status: "approved", requestedAt: "2026-02-25T07:30:00", approvedBy: "6", approvedAt: "2026-02-25T07:45:00" },
  { id: "e2", vehicleId: "v2", driverId: "3", scheduleId: "s2", reason: "Supply pickup from Harar", status: "pending", requestedAt: "2026-02-25T09:00:00" },
];

export const mockMaintenanceRequests: MaintenanceRequest[] = [
  { id: "m1", vehicleId: "v3", requestedBy: "3", type: "repair", description: "Engine overheating issue", priority: "high", status: "in_progress", estimatedCost: 15000, requestedAt: "2026-02-20" },
  { id: "m2", vehicleId: "v1", requestedBy: "3", type: "routine", description: "Regular oil change and filter replacement", priority: "medium", status: "pending", estimatedCost: 3500, requestedAt: "2026-02-23" },
  { id: "m3", vehicleId: "v5", requestedBy: "3", type: "repair", description: "Brake pad replacement needed", priority: "critical", status: "pending", estimatedCost: 8000, requestedAt: "2026-02-24" },
];

export const mockUsers: User[] = [
  { id: "1", username: "admin", email: "admin@haramaya.edu.et", fullName: "Admin User", role: "system_admin", isActive: true, createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "2", username: "guard", email: "guard@haramaya.edu.et", fullName: "Security Officer", role: "security_guard", isActive: true, createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "3", username: "driver", email: "driver@haramaya.edu.et", fullName: "Abebe Kebede", role: "driver", isActive: true, createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "4", username: "mechanic", email: "mechanic@haramaya.edu.et", fullName: "Tekle Haile", role: "mechanic", isActive: true, createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "5", username: "scheduler", email: "scheduler@haramaya.edu.et", fullName: "Meron Tadesse", role: "scheduler", isActive: true, createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "6", username: "vmanager", email: "vmanager@haramaya.edu.et", fullName: "Dawit Mengistu", role: "vehicle_manager", isActive: true, createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "7", username: "user", email: "user@haramaya.edu.et", fullName: "Student User", role: "user", isActive: true, createdAt: "2024-01-01", updatedAt: "2024-01-01" },
];
