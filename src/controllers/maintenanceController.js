const MaintenanceRequest = require("../models/MaintenanceRequest");
const Vehicle = require("../models/Vehicle");
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require("../utils/response");
const { getPagination, getPaginationMeta } = require("../utils/pagination");

// Create maintenance request (Driver only)
exports.createMaintenanceRequest = async (req, res, next) => {
  try {
    const { vehicle_id, title, description, priority, notes } = req.body;

    // Verify vehicle exists
    const vehicle = await Vehicle.findById(vehicle_id);
    if (!vehicle) {
      return errorResponse(res, "Vehicle not found", 404);
    }

    const requestId = await MaintenanceRequest.create({
      vehicle_id,
      requested_by: req.user.id,
      title,
      description,
      priority,
      notes,
    });

    const maintenanceRequest = await MaintenanceRequest.findById(requestId);
    successResponse(
      res,
      maintenanceRequest,
      "Maintenance request created successfully",
      201,
    );
  } catch (error) {
    next(error);
  }
};

// Get all maintenance requests (Vehicle Manager, Mechanic)
exports.getAllMaintenanceRequests = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req);
    const { status } = req.query;

    const requests = await MaintenanceRequest.findAll(limit, offset, status);
    const total = await MaintenanceRequest.count(status);
    const pagination = getPaginationMeta(page, limit, total);

    paginatedResponse(
      res,
      requests,
      pagination,
      "Maintenance requests retrieved successfully",
    );
  } catch (error) {
    next(error);
  }
};

// Get maintenance request by ID
exports.getMaintenanceRequestById = async (req, res, next) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id);

    if (!request) {
      return errorResponse(res, "Maintenance request not found", 404);
    }

    successResponse(res, request, "Maintenance request retrieved successfully");
  } catch (error) {
    next(error);
  }
};

// Update maintenance status (Mechanic, Vehicle Manager)
exports.updateMaintenanceStatus = async (req, res, next) => {
  try {
    const { status, assigned_to, notes, estimated_cost, actual_cost } =
      req.body;
    const requestId = req.params.id;

    const request = await MaintenanceRequest.findById(requestId);
    if (!request) {
      return errorResponse(res, "Maintenance request not found", 404);
    }

    // Update status
    await MaintenanceRequest.updateStatus(
      requestId,
      status,
      assigned_to,
      notes,
    );

    // Update costs if provided
    if (estimated_cost || actual_cost) {
      await MaintenanceRequest.update(requestId, {
        estimated_cost,
        actual_cost,
      });
    }

    const updatedRequest = await MaintenanceRequest.findById(requestId);
    successResponse(
      res,
      updatedRequest,
      "Maintenance request updated successfully",
    );
  } catch (error) {
    next(error);
  }
};
