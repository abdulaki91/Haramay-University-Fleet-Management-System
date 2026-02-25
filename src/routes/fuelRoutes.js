const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const fuelController = require("../controllers/fuelController");
const { authenticate, authorize } = require("../middlewares/auth");
const validate = require("../middlewares/validate");

// Add fuel record (Driver, Vehicle Manager)
router.post(
  "/",
  [
    authenticate,
    authorize("driver", "vehicle_manager"),
    body("vehicle_id").isInt().withMessage("Valid vehicle ID is required"),
    body("fuel_amount")
      .isFloat({ min: 0 })
      .withMessage("Valid fuel amount is required"),
    body("cost").isFloat({ min: 0 }).withMessage("Valid cost is required"),
    body("odometer_reading")
      .isFloat({ min: 0 })
      .withMessage("Valid odometer reading is required"),
    validate,
  ],
  fuelController.addFuelRecord,
);

// Get all fuel records (Vehicle Manager)
router.get(
  "/",
  authenticate,
  authorize("vehicle_manager"),
  fuelController.getAllFuelRecords,
);

// Get fuel history for vehicle (Vehicle Manager)
router.get(
  "/vehicle/:vehicleId",
  authenticate,
  authorize("vehicle_manager"),
  fuelController.getFuelHistory,
);

// Calculate fuel consumption (Vehicle Manager)
router.get(
  "/vehicle/:vehicleId/consumption",
  authenticate,
  authorize("vehicle_manager"),
  fuelController.calculateConsumption,
);

// Calculate fuel balance (Vehicle Manager)
router.get(
  "/vehicle/:vehicleId/balance",
  authenticate,
  authorize("vehicle_manager"),
  fuelController.calculateFuelBalance,
);

module.exports = router;
