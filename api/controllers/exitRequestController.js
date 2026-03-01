const ExitRequest = require("../models/ExitRequest");
const Vehicle = require("../models/Vehicle");
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require("../utils/response");
const { getPagination, getPaginationMeta } = require("../utils/pagination");
const { emitToRole, emitToUser } = require("../services/socketService");
const { transformExitRequest } = require("../utils/transformer");

// Create exit request (Driver only)
exports.createExitRequest = async (req, res, next) => {
  try {
    console.log("Exit request body:", req.body);

    // Accept both camelCase and snake_case
    const exitData = req.body.vehicleId
      ? {
          vehicle_id: req.body.vehicleId,
          driver_id: req.body.driverId || req.user.id,
          schedule_id: req.body.scheduleId,
          destination: req.body.destination,
          purpose: req.body.purpose,
          expected_return: req.body.expectedReturn,
          notes: req.body.notes,
        }
      : req.body;

    const {
      vehicle_id,
      driver_id,
      schedule_id,
      destination,
      purpose,
      expected_return,
      notes,
    } = exitData;

    console.log("Processed exit data:", {
      vehicle_id,
      driver_id,
      schedule_id,
      destination,
      purpose,
      expected_return,
      notes,
    });

    // Verify vehicle exists
    const vehicle = await Vehicle.findById(vehicle_id);
    if (!vehicle) {
      return errorResponse(res, "Vehicle not found", 404);
    }

    const requestId = await ExitRequest.create({
      vehicle_id,
      driver_id: driver_id || req.user.id,
      schedule_id,
      destination,
      purpose,
      expected_return,
      notes,
    });

    const exitRequest = await ExitRequest.findById(requestId);
    const transformedRequest = transformExitRequest(exitRequest);

    // Emit real-time notification to vehicle managers
    emitToRole("vehicle_manager", "exit_request:created", transformedRequest);

    successResponse(
      res,
      transformedRequest,
      "Exit request created successfully",
      201,
    );
  } catch (error) {
    console.error("Exit request creation error:", error);
    next(error);
  }
};

// Get all exit requests (Vehicle Manager, Driver)
exports.getAllExitRequests = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req);
    const { status } = req.query;

    let requests = await ExitRequest.findAll(limit, offset, status);

    // Filter exit requests for drivers - only show their own requests
    if (req.user.role_name === "driver") {
      requests = requests.filter((r) => r.driver_id === req.user.id);
    }

    const transformedRequests = requests.map(transformExitRequest);

    // Adjust total count for drivers
    let total;
    if (req.user.role_name === "driver") {
      total = transformedRequests.length;
    } else {
      total = await ExitRequest.count(status);
    }

    const pagination = getPaginationMeta(page, limit, total);

    paginatedResponse(
      res,
      transformedRequests,
      pagination,
      "Exit requests retrieved successfully",
    );
  } catch (error) {
    next(error);
  }
};

// Get approved exit requests (Security Guard only)
exports.getApprovedExitRequests = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req);

    const requests = await ExitRequest.findApproved(limit, offset);
    const total = await ExitRequest.count("approved");
    const pagination = getPaginationMeta(page, limit, total);

    paginatedResponse(
      res,
      requests,
      pagination,
      "Approved exit requests retrieved successfully",
    );
  } catch (error) {
    next(error);
  }
};

// Get exit request by ID
exports.getExitRequestById = async (req, res, next) => {
  try {
    const request = await ExitRequest.findById(req.params.id);

    if (!request) {
      return errorResponse(res, "Exit request not found", 404);
    }

    successResponse(res, request, "Exit request retrieved successfully");
  } catch (error) {
    next(error);
  }
};

// Approve exit request (Vehicle Manager only)
exports.approveExitRequest = async (req, res, next) => {
  try {
    const requestId = req.params.id;

    const request = await ExitRequest.findById(requestId);
    if (!request) {
      return errorResponse(res, "Exit request not found", 404);
    }

    if (request.status !== "pending") {
      return errorResponse(res, "Only pending requests can be approved", 400);
    }

    await ExitRequest.approve(requestId, req.user.id);
    const updatedRequest = await ExitRequest.findById(requestId);

    // Emit real-time notifications
    emitToUser(request.driver_id, "exit_request:approved", updatedRequest);
    emitToRole("security_guard", "exit_request:approved", updatedRequest);

    successResponse(res, updatedRequest, "Exit request approved successfully");
  } catch (error) {
    next(error);
  }
};

// Reject exit request (Vehicle Manager only)
exports.rejectExitRequest = async (req, res, next) => {
  try {
    const requestId = req.params.id;
    const { rejection_reason } = req.body;

    if (!rejection_reason) {
      return errorResponse(res, "Rejection reason is required", 400);
    }

    const request = await ExitRequest.findById(requestId);
    if (!request) {
      return errorResponse(res, "Exit request not found", 404);
    }

    if (request.status !== "pending") {
      return errorResponse(res, "Only pending requests can be rejected", 400);
    }

    await ExitRequest.reject(requestId, req.user.id, rejection_reason);
    const updatedRequest = await ExitRequest.findById(requestId);

    // Emit real-time notification to driver
    emitToUser(request.driver_id, "exit_request:rejected", updatedRequest);

    successResponse(res, updatedRequest, "Exit request rejected");
  } catch (error) {
    next(error);
  }
};
