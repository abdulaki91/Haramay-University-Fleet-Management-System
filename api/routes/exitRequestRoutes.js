const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const exitRequestController = require("../controllers/exitRequestController");
const { authenticate, authorize } = require("../middlewares/auth");
const validate = require("../middlewares/validate");

// Create exit request (Driver only)
router.post(
  "/",
  [
    authenticate,
    authorize("driver"),
    // Accept both camelCase and snake_case
    body().custom((value, { req }) => {
      console.log("Validation - Request body:", req.body);

      if (!req.body.vehicleId && !req.body.vehicle_id) {
        throw new Error("Vehicle ID is required");
      }
      if (!req.body.destination) {
        throw new Error("Destination is required");
      }
      if (!req.body.purpose) {
        throw new Error("Purpose is required");
      }
      if (!req.body.expectedReturn && !req.body.expected_return) {
        throw new Error("Expected return date is required");
      }
      return true;
    }),
    validate,
  ],
  exitRequestController.createExitRequest,
);

// Get all exit requests (Vehicle Manager, Driver, Security Guard)
router.get(
  "/",
  authenticate,
  authorize("vehicle_manager", "driver", "security_guard"),
  exitRequestController.getAllExitRequests,
);

// Get approved exit requests (Security Guard only)
router.get(
  "/approved",
  authenticate,
  authorize("security_guard"),
  exitRequestController.getApprovedExitRequests,
);

// Get exit request by ID (Vehicle Manager, Security Guard)
router.get(
  "/:id",
  authenticate,
  authorize("vehicle_manager", "security_guard"),
  exitRequestController.getExitRequestById,
);

// Approve exit request (Vehicle Manager only)
router.put(
  "/:id/approve",
  authenticate,
  authorize("vehicle_manager"),
  exitRequestController.approveExitRequest,
);

// Reject exit request (Vehicle Manager only)
router.put(
  "/:id/reject",
  [
    authenticate,
    authorize("vehicle_manager"),
    body("rejection_reason")
      .notEmpty()
      .withMessage("Rejection reason is required"),
    validate,
  ],
  exitRequestController.rejectExitRequest,
);

module.exports = router;
