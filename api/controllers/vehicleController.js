const Vehicle = require("../models/Vehicle");
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require("../utils/response");
const { getPagination, getPaginationMeta } = require("../utils/pagination");
const { emitToAll } = require("../services/socketService");
const {
  transformVehicle,
  transformVehicleToDb,
} = require("../utils/transformer");

// Register vehicle (Vehicle Manager only)
exports.registerVehicle = async (req, res, next) => {
  try {
    // Accept both camelCase and snake_case
    const vehicleData = req.body.plateNumber
      ? transformVehicleToDb(req.body)
      : req.body;

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
    } = vehicleData;

    const vehicleId = await Vehicle.create({
      plate_number,
      make,
      model,
      year,
      color,
      vin,
      capacity,
      fuel_type,
      status: status || "available",
      mileage: mileage || 0,
    });

    const vehicle = await Vehicle.findById(vehicleId);
    const transformedVehicle = transformVehicle(vehicle);

    successResponse(
      res,
      transformedVehicle,
      "Vehicle registered successfully",
      201,
    );
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
    const transformedVehicles = vehicles.map(transformVehicle);
    const total = await Vehicle.count(status);
    const pagination = getPaginationMeta(page, limit, total);

    paginatedResponse(
      res,
      transformedVehicles,
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

    const transformedVehicle = transformVehicle(vehicle);
    successResponse(res, transformedVehicle, "Vehicle retrieved successfully");
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

    const transformedVehicles = vehicles.map(transformVehicle);
    successResponse(res, transformedVehicles, "Vehicles found");
  } catch (error) {
    next(error);
  }
};

// Update vehicle (Vehicle Manager only)
exports.updateVehicle = async (req, res, next) => {
  try {
    const vehicleId = req.params.id;

    // Accept both camelCase and snake_case
    const vehicleData = req.body.plateNumber
      ? transformVehicleToDb(req.body)
      : req.body;

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
    } = vehicleData;

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
    const transformedVehicle = transformVehicle(updatedVehicle);

    // Emit real-time notification about vehicle update
    emitToAll("vehicle:updated", transformedVehicle);

    successResponse(res, transformedVehicle, "Vehicle updated successfully");
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
    const transformedVehicle = transformVehicle(updatedVehicle);

    // Emit real-time notification to all users about vehicle status change
    emitToAll("vehicle:updated", transformedVehicle);

    successResponse(
      res,
      transformedVehicle,
      "Vehicle status updated successfully",
    );
  } catch (error) {
    next(error);
  }
};
