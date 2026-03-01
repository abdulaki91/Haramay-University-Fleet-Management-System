const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const scheduleController = require("../controllers/scheduleController");
const { authenticate, authorize } = require("../middlewares/auth");
const validate = require("../middlewares/validate");

// Create schedule (Scheduler only)
router.post(
  "/",
  [
    authenticate,
    authorize("scheduler"),
    // Accept both camelCase and snake_case
    body().custom((value, { req }) => {
      // Check vehicle_id or vehicleId
      if (!req.body.vehicleId && !req.body.vehicle_id) {
        throw new Error("Vehicle ID is required");
      }
      // Check driver_id or driverId
      if (!req.body.driverId && !req.body.driver_id) {
        throw new Error("Driver ID is required");
      }
      // Check start_date or departureTime
      if (!req.body.departureTime && !req.body.start_date) {
        throw new Error("Departure time is required");
      }
      // Check end_date or returnTime
      if (!req.body.returnTime && !req.body.end_date) {
        throw new Error("Return time is required");
      }
      return true;
    }),
    body("purpose").notEmpty().withMessage("Purpose is required"),
    body("destination").notEmpty().withMessage("Destination is required"),
    validate,
  ],
  scheduleController.createSchedule,
);

// Get all schedules (Admin, Scheduler, Driver, User)
router.get(
  "/",
  authenticate,
  authorize("system_admin", "scheduler", "driver", "user", "vehicle_manager"),
  scheduleController.getAllSchedules,
);

// Get schedule by ID (Admin, Scheduler, Driver, User)
router.get(
  "/:id",
  authenticate,
  authorize("system_admin", "scheduler", "driver", "user", "vehicle_manager"),
  scheduleController.getScheduleById,
);

// Update schedule (Scheduler only)
router.put(
  "/:id",
  [authenticate, authorize("scheduler"), validate],
  scheduleController.updateSchedule,
);

// Delete schedule (Scheduler only)
router.delete(
  "/:id",
  authenticate,
  authorize("scheduler"),
  scheduleController.deleteSchedule,
);

module.exports = router;
