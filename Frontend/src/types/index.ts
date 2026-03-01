export type Role =
  | "system_admin"
  | "security_guard"
  | "driver"
  | "mechanic"
  | "scheduler"
  | "vehicle_manager"
  | "user";

export const ROLE_LABELS: Record<Role, string> = {
  system_admin: "System Admin",
  security_guard: "Security Guard",
  driver: "Driver",
  mechanic: "Mechanic",
  scheduler: "Scheduler",
  vehicle_manager: "Vehicle Manager",
  user: "User",
};

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  make: string;
  year: number;
  type: "bus" | "van" | "pickup" | "sedan" | "truck";
  status: "available" | "in_use" | "maintenance" | "retired";
  fuelType: "diesel" | "petrol" | "electric" | "hybrid";
  mileage: number;
  registeredAt: string;
}

export interface Schedule {
  id: string;
  vehicleId: string;
  driverId: string;
  destination: string;
  departureTime: string;
  returnTime: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  purpose: string;
  passengers: number;
  createdAt: string;
}

export interface FuelRecord {
  id: string;
  vehicleId: string;
  driverId: string;
  liters: number;
  costPerLiter: number;
  totalCost: number;
  odometerReading: number;
  fueledAt: string;
  station: string;
}

export interface ExitRequest {
  id: string;
  vehicleId: string;
  driverId: string;
  scheduleId: string;
  reason: string;
  status: "pending" | "approved" | "denied";
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface MaintenanceRequest {
  id: string;
  vehicleId: string;
  requestedBy: string;
  type: "routine" | "repair" | "emergency";
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  estimatedCost?: number;
  actualCost?: number;
  requestedAt: string;
  completedAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles: Role[];
}
