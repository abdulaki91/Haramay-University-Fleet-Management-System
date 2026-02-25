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
    body("vehicle_id").isInt().withMessage("Valid vehicle ID is required"),
    body("destination").notEmpty().withMessage("Destination is required"),
    body("purpose").notEmpty().withMessage("Purpose is required"),
    body("expected_return")
      .isISO8601()
      .withMessage("Valid expected return date is required"),
    validate,
  ],
  exitRequestController.createExitRequest,
);

// Get all exit requests (Vehicle Manager)
router.get(
  "/",
  authenticate,
  authorize("vehicle_manager"),
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
