const FuelRecord = require("../models/FuelRecord");
const Vehicle = require("../models/Vehicle");
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require("../utils/response");
const { getPagination, getPaginationMeta } = require("../utils/pagination");

// Add fuel record
exports.addFuelRecord = async (req, res, next) => {
  try {
    const {
      vehicle_id,
      fuel_amount,
      cost,
      odometer_reading,
      fuel_station,
      receipt_number,
      notes,
    } = req.body;

    // Verify vehicle exists
    const vehicle = await Vehicle.findById(vehicle_id);
    if (!vehicle) {
      return errorResponse(res, "Vehicle not found", 404);
    }

    const fuelId = await FuelRecord.create({
      vehicle_id,
      driver_id: req.user.id,
      fuel_amount,
      cost,
      odometer_reading,
      fuel_station,
      receipt_number,
      notes,
    });

    const fuelRecord = await FuelRecord.findById(fuelId);
    successResponse(res, fuelRecord, "Fuel record added successfully", 201);
  } catch (error) {
    next(error);
  }
};

// Get all fuel records
exports.getAllFuelRecords = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req);

    const fuelRecords = await FuelRecord.findAll(limit, offset);
    const total = await FuelRecord.count();
    const pagination = getPaginationMeta(page, limit, total);

    paginatedResponse(
      res,
      fuelRecords,
      pagination,
      "Fuel records retrieved successfully",
    );
  } catch (error) {
    next(error);
  }
};

// Get fuel history for a vehicle
exports.getFuelHistory = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;
    const { page, limit, offset } = getPagination(req);

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return errorResponse(res, "Vehicle not found", 404);
    }

    const fuelRecords = await FuelRecord.findByVehicle(
      vehicleId,
      limit,
      offset,
    );
    const total = await FuelRecord.count(vehicleId);
    const pagination = getPaginationMeta(page, limit, total);

    paginatedResponse(
      res,
      fuelRecords,
      pagination,
      "Fuel history retrieved successfully",
    );
  } catch (error) {
    next(error);
  }
};

// Calculate fuel consumption for a vehicle
exports.calculateConsumption = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return errorResponse(res, "Vehicle not found", 404);
    }

    const consumption = await FuelRecord.calculateConsumption(vehicleId);
    successResponse(
      res,
      consumption,
      "Fuel consumption calculated successfully",
    );
  } catch (error) {
    next(error);
  }
};

// Calculate fuel balance for a vehicle (Vehicle Manager)
exports.calculateFuelBalance = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return errorResponse(res, "Vehicle not found", 404);
    }

    const balance = await FuelRecord.calculateBalance(vehicleId);
    successResponse(
      res,
      {
        vehicle_id: vehicleId,
        plate_number: vehicle.plate_number,
        ...balance,
      },
      "Fuel balance calculated successfully",
    );
  } catch (error) {
    next(error);
  }
};
