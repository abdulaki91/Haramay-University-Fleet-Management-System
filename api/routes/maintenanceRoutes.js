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
    // Accept both camelCase and snake_case
    body().custom((value, { req }) => {
      console.log("Maintenance validation - Request body:", req.body);

      if (!req.body.vehicleId && !req.body.vehicle_id) {
        throw new Error("Vehicle ID is required");
      }
      if (!req.body.description) {
        throw new Error("Description is required");
      }
      if (
        req.body.priority &&
        !["low", "medium", "high", "critical"].includes(req.body.priority)
      ) {
        throw new Error("Valid priority is required");
      }
      return true;
    }),
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
