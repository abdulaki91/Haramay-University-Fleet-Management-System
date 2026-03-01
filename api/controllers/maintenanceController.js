const MaintenanceRequest = require("../models/MaintenanceRequest");
const Vehicle = require("../models/Vehicle");
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require("../utils/response");
const { getPagination, getPaginationMeta } = require("../utils/pagination");
const { emitToRole, emitToUser } = require("../services/socketService");
const { transformMaintenanceRequest } = require("../utils/transformer");

// Create maintenance request (Driver only)
exports.createMaintenanceRequest = async (req, res, next) => {
  try {
    console.log("Maintenance request body:", req.body);

    // Accept both camelCase and snake_case
    const maintenanceData = req.body.vehicleId
      ? {
          vehicle_id: req.body.vehicleId,
          requested_by: req.body.requestedBy || req.user.id,
          title:
            req.body.title ||
            req.body.description?.substring(0, 100) ||
            "Maintenance Request",
          description: req.body.description,
          priority: req.body.priority,
          notes: req.body.notes,
        }
      : req.body;

    const { vehicle_id, requested_by, title, description, priority, notes } =
      maintenanceData;

    console.log("Processed maintenance data:", {
      vehicle_id,
      requested_by,
      title,
      description,
      priority,
      notes,
    });

    // Verify vehicle exists
    const vehicle = await Vehicle.findById(vehicle_id);
    if (!vehicle) {
      return errorResponse(res, "Vehicle not found", 404);
    }

    const requestId = await MaintenanceRequest.create({
      vehicle_id,
      requested_by: requested_by || req.user.id,
      title,
      description,
      priority,
      notes,
    });

    const maintenanceRequest = await MaintenanceRequest.findById(requestId);
    const transformedRequest = transformMaintenanceRequest(maintenanceRequest);

    // Emit real-time notification to vehicle managers and mechanics
    emitToRole("vehicle_manager", "maintenance:created", transformedRequest);
    emitToRole("mechanic", "maintenance:created", transformedRequest);

    successResponse(
      res,
      transformedRequest,
      "Maintenance request created successfully",
      201,
    );
  } catch (error) {
    console.error("Maintenance request creation error:", error);
    next(error);
  }
};

// Get all maintenance requests (Vehicle Manager, Mechanic, Driver)
exports.getAllMaintenanceRequests = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req);
    const { status } = req.query;

    let requests = await MaintenanceRequest.findAll(limit, offset, status);

    // Filter maintenance requests for drivers - only show their own requests
    if (req.user.role_name === "driver") {
      requests = requests.filter((r) => r.requested_by === req.user.id);
    }

    const transformedRequests = requests.map(transformMaintenanceRequest);

    // Adjust total count for drivers
    let total;
    if (req.user.role_name === "driver") {
      total = transformedRequests.length;
    } else {
      total = await MaintenanceRequest.count(status);
    }

    const pagination = getPaginationMeta(page, limit, total);

    paginatedResponse(
      res,
      transformedRequests,
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

    // Emit real-time notification to requester and relevant roles
    emitToUser(request.requested_by, "maintenance:updated", updatedRequest);
    emitToRole("vehicle_manager", "maintenance:updated", updatedRequest);
    if (assigned_to) {
      emitToUser(assigned_to, "maintenance:assigned", updatedRequest);
    }

    successResponse(
      res,
      updatedRequest,
      "Maintenance request updated successfully",
    );
  } catch (error) {
    next(error);
  }
};
