const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const vehicleController = require("../controllers/vehicleController");
const { authenticate, authorize } = require("../middlewares/auth");
const validate = require("../middlewares/validate");

// Register vehicle (Vehicle Manager only)
router.post(
  "/",
  [
    authenticate,
    authorize("vehicle_manager"),
    body("plate_number").notEmpty().withMessage("Plate number is required"),
    body("make").notEmpty().withMessage("Make is required"),
    body("model").notEmpty().withMessage("Model is required"),
    body("year")
      .isInt({ min: 1900, max: 2100 })
      .withMessage("Valid year is required"),
    body("fuel_type")
      .isIn(["petrol", "diesel", "electric", "hybrid"])
      .withMessage("Valid fuel type is required"),
    validate,
  ],
  vehicleController.registerVehicle,
);

// Get all vehicles (All authenticated users can view)
router.get("/", authenticate, vehicleController.getAllVehicles);

// Search by plate number (Scheduler, Vehicle Manager)
router.get(
  "/search/:plateNumber",
  authenticate,
  authorize("scheduler", "vehicle_manager"),
  vehicleController.searchByPlateNumber,
);

// Get vehicle by ID
router.get("/:id", authenticate, vehicleController.getVehicleById);

// Update vehicle (Vehicle Manager only)
router.put(
  "/:id",
  [authenticate, authorize("vehicle_manager"), validate],
  vehicleController.updateVehicle,
);

// Update vehicle status (Vehicle Manager only)
router.put(
  "/:id/status",
  [
    authenticate,
    authorize("vehicle_manager"),
    body("status")
      .isIn(["available", "in_use", "maintenance", "out_of_service"])
      .withMessage("Valid status is required"),
    validate,
  ],
  vehicleController.updateVehicleStatus,
);

module.exports = router;
