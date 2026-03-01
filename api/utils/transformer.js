/**
 * Transform database records to frontend-friendly format
 * Converts snake_case to camelCase and combines fields
 */

const toCamelCase = (str) => {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
};

const toSnakeCase = (str) => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

const transformKeys = (obj, transformer) => {
  if (Array.isArray(obj)) {
    return obj.map((item) => transformKeys(item, transformer));
  }

  if (obj !== null && typeof obj === "object") {
    return Object.keys(obj).reduce((result, key) => {
      const newKey = transformer(key);
      result[newKey] = transformKeys(obj[key], transformer);
      return result;
    }, {});
  }

  return obj;
};

// Transform user data from database to frontend format
const transformUser = (user) => {
  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: `${user.first_name} ${user.last_name}`,
    firstName: user.first_name,
    lastName: user.last_name,
    phone: user.phone,
    role: user.role_name,
    roleId: user.role_id,
    isActive: Boolean(user.is_active),
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
};

// Transform vehicle data from database to frontend format
const transformVehicle = (vehicle) => {
  if (!vehicle) return null;

  return {
    id: vehicle.id,
    plateNumber: vehicle.plate_number,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    color: vehicle.color,
    vin: vehicle.vin,
    capacity: vehicle.capacity,
    type: vehicle.type,
    fuelType: vehicle.fuel_type,
    status: vehicle.status,
    mileage: vehicle.mileage,
    registeredAt: vehicle.registered_at,
  };
};

// Transform schedule data from database to frontend format
const transformSchedule = (schedule) => {
  if (!schedule) return null;

  return {
    id: schedule.id,
    vehicleId: schedule.vehicle_id,
    driverId: schedule.driver_id,
    destination: schedule.destination,
    departureTime: schedule.start_date,
    returnTime: schedule.end_date,
    status: schedule.status,
    purpose: schedule.purpose,
    passengers: schedule.passengers,
    notes: schedule.notes,
    createdAt: schedule.created_at,
    createdBy: schedule.created_by,
  };
};

// Transform fuel record from database to frontend format
const transformFuelRecord = (fuel) => {
  if (!fuel) return null;

  return {
    id: fuel.id,
    vehicleId: fuel.vehicle_id,
    driverId: fuel.driver_id,
    liters: parseFloat(fuel.fuel_amount),
    costPerLiter: parseFloat(fuel.cost) / parseFloat(fuel.fuel_amount),
    totalCost: parseFloat(fuel.cost),
    odometerReading: fuel.odometer_reading,
    station: fuel.fuel_station,
    fueledAt: fuel.fueled_at,
    receiptNumber: fuel.receipt_number,
    notes: fuel.notes,
  };
};

// Transform exit request from database to frontend format
const transformExitRequest = (exit) => {
  if (!exit) return null;

  return {
    id: exit.id,
    vehicleId: exit.vehicle_id,
    driverId: exit.driver_id,
    scheduleId: exit.schedule_id,
    reason: exit.purpose,
    destination: exit.destination,
    status: exit.status,
    requestedAt: exit.requested_at,
    approvedBy: exit.approved_by,
    approvedAt: exit.approved_at,
    rejectedBy: exit.rejected_by,
    rejectionReason: exit.rejection_reason,
    expectedReturn: exit.expected_return,
    notes: exit.notes,
  };
};

// Transform maintenance request from database to frontend format
const transformMaintenanceRequest = (maintenance) => {
  if (!maintenance) return null;

  return {
    id: maintenance.id,
    vehicleId: maintenance.vehicle_id,
    requestedBy: maintenance.requested_by,
    type: maintenance.type || "routine",
    description: maintenance.description,
    title: maintenance.title,
    priority: maintenance.priority,
    status: maintenance.status,
    estimatedCost: maintenance.estimated_cost
      ? parseFloat(maintenance.estimated_cost)
      : null,
    actualCost: maintenance.actual_cost
      ? parseFloat(maintenance.actual_cost)
      : null,
    requestedAt: maintenance.requested_at,
    completedAt: maintenance.completed_at,
    assignedTo: maintenance.assigned_to,
    notes: maintenance.notes,
  };
};

// Transform frontend data to database format for user
const transformUserToDb = (user) => {
  const names = user.fullName ? user.fullName.split(" ") : [];
  return {
    first_name: user.firstName || names[0] || "",
    last_name: user.lastName || names.slice(1).join(" ") || "",
    username: user.username,
    email: user.email,
    phone: user.phone,
    role_id: user.roleId,
    is_active: user.isActive ? 1 : 0,
  };
};

// Transform frontend data to database format for vehicle
const transformVehicleToDb = (vehicle) => {
  return {
    plate_number: vehicle.plateNumber,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    color: vehicle.color,
    vin: vehicle.vin,
    capacity: vehicle.capacity,
    type: vehicle.type,
    fuel_type: vehicle.fuelType,
    status: vehicle.status,
    mileage: vehicle.mileage,
  };
};

module.exports = {
  toCamelCase,
  toSnakeCase,
  transformKeys,
  transformUser,
  transformVehicle,
  transformSchedule,
  transformFuelRecord,
  transformExitRequest,
  transformMaintenanceRequest,
  transformUserToDb,
  transformVehicleToDb,
};
