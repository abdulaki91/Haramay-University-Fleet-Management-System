const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const { authenticate, authorize } = require("../middlewares/auth");

// Vehicle summary report (Admin, Vehicle Manager)
router.get(
  "/vehicles",
  authenticate,
  authorize("admin", "vehicle_manager"),
  reportController.getVehicleSummaryReport,
);

// Maintenance report (Admin, Vehicle Manager)
router.get(
  "/maintenance",
  authenticate,
  authorize("admin", "vehicle_manager"),
  reportController.getMaintenanceReport,
);

// Fuel usage report (Admin, Vehicle Manager)
router.get(
  "/fuel",
  authenticate,
  authorize("admin", "vehicle_manager"),
  reportController.getFuelUsageReport,
);

// System report (Admin only)
router.get(
  "/system",
  authenticate,
  authorize("admin"),
  reportController.getSystemReport,
);

module.exports = router;
