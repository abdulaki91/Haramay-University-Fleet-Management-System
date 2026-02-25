const Schedule = require("../models/Schedule");
const Vehicle = require("../models/Vehicle");
const User = require("../models/User");
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require("../utils/response");
const { getPagination, getPaginationMeta } = require("../utils/pagination");

// Create schedule (Scheduler only)
exports.createSchedule = async (req, res, next) => {
  try {
    const {
      vehicle_id,
      driver_id,
      purpose,
      destination,
      start_date,
      end_date,
      passengers,
      notes,
    } = req.body;

    // Verify vehicle exists
    const vehicle = await Vehicle.findById(vehicle_id);
    if (!vehicle) {
      return errorResponse(res, "Vehicle not found", 404);
    }

    // Verify driver exists
    const driver = await User.findById(driver_id);
    if (!driver) {
      return errorResponse(res, "Driver not found", 404);
    }

    const scheduleId = await Schedule.create({
      vehicle_id,
      driver_id,
      created_by: req.user.id,
      purpose,
      destination,
      start_date,
      end_date,
      passengers,
      notes,
    });

    const schedule = await Schedule.findById(scheduleId);
    successResponse(res, schedule, "Schedule created successfully", 201);
  } catch (error) {
    next(error);
  }
};

// Get all schedules (Admin, Scheduler, Driver, User)
exports.getAllSchedules = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req);
    const { status } = req.query;

    const schedules = await Schedule.findAll(limit, offset, status);
    const total = await Schedule.count(status);
    const pagination = getPaginationMeta(page, limit, total);

    paginatedResponse(
      res,
      schedules,
      pagination,
      "Schedules retrieved successfully",
    );
  } catch (error) {
    next(error);
  }
};

// Get schedule by ID
exports.getScheduleById = async (req, res, next) => {
  try {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return errorResponse(res, "Schedule not found", 404);
    }

    successResponse(res, schedule, "Schedule retrieved successfully");
  } catch (error) {
    next(error);
  }
};

// Update schedule (Scheduler only)
exports.updateSchedule = async (req, res, next) => {
  try {
    const scheduleId = req.params.id;
    const {
      vehicle_id,
      driver_id,
      purpose,
      destination,
      start_date,
      end_date,
      passengers,
      status,
      notes,
    } = req.body;

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return errorResponse(res, "Schedule not found", 404);
    }

    await Schedule.update(scheduleId, {
      vehicle_id,
      driver_id,
      purpose,
      destination,
      start_date,
      end_date,
      passengers,
      status,
      notes,
    });

    const updatedSchedule = await Schedule.findById(scheduleId);
    successResponse(res, updatedSchedule, "Schedule updated successfully");
  } catch (error) {
    next(error);
  }
};

// Delete schedule (Scheduler only)
exports.deleteSchedule = async (req, res, next) => {
  try {
    const scheduleId = req.params.id;

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return errorResponse(res, "Schedule not found", 404);
    }

    await Schedule.delete(scheduleId);
    successResponse(res, null, "Schedule deleted successfully");
  } catch (error) {
    next(error);
  }
};
