const Vehicle = require("../models/Vehicle");
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require("../utils/response");
const { getPagination, getPaginationMeta } = require("../utils/pagination");

// Register vehicle (Vehicle Manager only)
exports.registerVehicle = async (req, res, next) => {
  try {
    const {
      plate_number,
      make,
      model,
      year,
      color,
      vin,
      capacity,
      fuel_type,
      status,
      mileage,
    } = req.body;

    const vehicleId = await Vehicle.create({
      plate_number,
      make,
      model,
      year,
      color,
      vin,
      capacity,
      fuel_type,
      status,
      mileage,
    });

    const vehicle = await Vehicle.findById(vehicleId);
    successResponse(res, vehicle, "Vehicle registered successfully", 201);
  } catch (error) {
    next(error);
  }
};

// Get all vehicles
exports.getAllVehicles = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req);
    const { status } = req.query;

    const vehicles = await Vehicle.findAll(limit, offset, status);
    const total = await Vehicle.count(status);
    const pagination = getPaginationMeta(page, limit, total);

    paginatedResponse(
      res,
      vehicles,
      pagination,
      "Vehicles retrieved successfully",
    );
  } catch (error) {
    next(error);
  }
};

// Get vehicle by ID
exports.getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return errorResponse(res, "Vehicle not found", 404);
    }

    successResponse(res, vehicle, "Vehicle retrieved successfully");
  } catch (error) {
    next(error);
  }
};

// Search vehicle by plate number (Scheduler, Vehicle Manager)
exports.searchByPlateNumber = async (req, res, next) => {
  try {
    const { plateNumber } = req.params;

    const vehicles = await Vehicle.findByPlateNumber(plateNumber);

    if (vehicles.length === 0) {
      return errorResponse(
        res,
        "No vehicles found with that plate number",
        404,
      );
    }

    successResponse(res, vehicles, "Vehicles found");
  } catch (error) {
    next(error);
  }
};

// Update vehicle (Vehicle Manager only)
exports.updateVehicle = async (req, res, next) => {
  try {
    const vehicleId = req.params.id;
    const {
      plate_number,
      make,
      model,
      year,
      color,
      vin,
      capacity,
      fuel_type,
      mileage,
    } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return errorResponse(res, "Vehicle not found", 404);
    }

    await Vehicle.update(vehicleId, {
      plate_number,
      make,
      model,
      year,
      color,
      vin,
      capacity,
      fuel_type,
      mileage,
    });

    const updatedVehicle = await Vehicle.findById(vehicleId);
    successResponse(res, updatedVehicle, "Vehicle updated successfully");
  } catch (error) {
    next(error);
  }
};

// Update vehicle status (Vehicle Manager only)
exports.updateVehicleStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const vehicleId = req.params.id;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return errorResponse(res, "Vehicle not found", 404);
    }

    await Vehicle.updateStatus(vehicleId, status);
    const updatedVehicle = await Vehicle.findById(vehicleId);

    successResponse(res, updatedVehicle, "Vehicle status updated successfully");
  } catch (error) {
    next(error);
  }
};
