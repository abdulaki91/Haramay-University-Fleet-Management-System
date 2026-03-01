const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const maintenanceController = require("../controllers/maintenanceController");
const { authenticate, authorize } = require("../middlewares/auth");
const validate = require("../middlewares/validate");

// Create maintenance request (Driver only)
router.post(
  "/",
  [
    authenticate,
    authorize("driver"),
    body("vehicle_id").isInt().withMessage("Valid vehicle ID is required"),
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("priority")
      .optional()
      .isIn(["low", "medium", "high", "critical"])
      .withMessage("Valid priority is required"),
    validate,
  ],
  maintenanceController.createMaintenanceRequest,
);

// Get all maintenance requests (Vehicle Manager, Mechanic, Driver)
router.get(
  "/",
  authenticate,
  authorize("vehicle_manager", "mechanic", "driver"),
  maintenanceController.getAllMaintenanceRequests,
);

// Get maintenance request by ID (Vehicle Manager, Mechanic)
router.get(
  "/:id",
  authenticate,
  authorize("vehicle_manager", "mechanic"),
  maintenanceController.getMaintenanceRequestById,
);

// Update maintenance status (Vehicle Manager, Mechanic)
router.put(
  "/:id/status",
  [
    authenticate,
    authorize("vehicle_manager", "mechanic"),
    body("status")
      .isIn(["pending", "in_progress", "completed", "cancelled"])
      .withMessage("Valid status is required"),
    validate,
  ],
  maintenanceController.updateMaintenanceStatus,
);

module.exports = router;
