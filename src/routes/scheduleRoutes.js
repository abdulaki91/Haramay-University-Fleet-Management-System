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
    body("vehicle_id").isInt().withMessage("Valid vehicle ID is required"),
    body("driver_id").isInt().withMessage("Valid driver ID is required"),
    body("purpose").notEmpty().withMessage("Purpose is required"),
    body("destination").notEmpty().withMessage("Destination is required"),
    body("start_date").isISO8601().withMessage("Valid start date is required"),
    body("end_date").isISO8601().withMessage("Valid end date is required"),
    validate,
  ],
  scheduleController.createSchedule,
);

// Get all schedules (Admin, Scheduler, Driver, User)
router.get(
  "/",
  authenticate,
  authorize("admin", "scheduler", "driver", "user"),
  scheduleController.getAllSchedules,
);

// Get schedule by ID (Admin, Scheduler, Driver, User)
router.get(
  "/:id",
  authenticate,
  authorize("admin", "scheduler", "driver", "user"),
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
