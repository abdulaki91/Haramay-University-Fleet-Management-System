const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const fuelController = require("../controllers/fuelController");
const { authenticate, authorize } = require("../middlewares/auth");
const validate = require("../middlewares/validate");

// Add fuel record (Vehicle Manager only)
router.post(
  "/",
  [
    authenticate,
    authorize("vehicle_manager"),
    // Accept both camelCase and snake_case
    body().custom((value, { req }) => {
      console.log("Fuel validation - Request body:", req.body);

      if (!req.body.vehicleId && !req.body.vehicle_id) {
        throw new Error("Vehicle ID is required");
      }
      if (!req.body.liters && !req.body.fuel_amount) {
        throw new Error("Fuel amount is required");
      }
      // Accept either totalCost, cost, or (liters * costPerLiter)
      if (
        !req.body.cost &&
        !req.body.totalCost &&
        !(req.body.liters && req.body.costPerLiter)
      ) {
        throw new Error("Cost is required");
      }
      if (!req.body.odometerReading && !req.body.odometer_reading) {
        throw new Error("Odometer reading is required");
      }
      return true;
    }),
    validate,
  ],
  fuelController.addFuelRecord,
);

// Get all fuel records (Vehicle Manager only)
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
