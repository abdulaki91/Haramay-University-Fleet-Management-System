const Schedule = require("../models/Schedule");
const Vehicle = require("../models/Vehicle");
const User = require("../models/User");
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require("../utils/response");
const { getPagination, getPaginationMeta } = require("../utils/pagination");
const { emitToRole, emitToUser } = require("../services/socketService");
const { transformSchedule } = require("../utils/transformer");

// Create schedule (Scheduler only)
exports.createSchedule = async (req, res, next) => {
  try {
    // Accept both camelCase and snake_case
    const scheduleData = req.body.vehicleId
      ? {
          vehicle_id: req.body.vehicleId,
          driver_id: req.body.driverId,
          purpose: req.body.purpose,
          destination: req.body.destination,
          start_date: req.body.departureTime,
          end_date: req.body.returnTime,
          passengers: req.body.passengers,
          notes: req.body.notes,
        }
      : req.body;

    const {
      vehicle_id,
      driver_id,
      purpose,
      destination,
      start_date,
      end_date,
      passengers,
      notes,
    } = scheduleData;

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
    const transformedSchedule = transformSchedule(schedule);

    // Emit real-time notification to driver
    emitToUser(driver_id, "schedule:created", transformedSchedule);
    emitToRole("scheduler", "schedule:created", transformedSchedule);

    successResponse(
      res,
      transformedSchedule,
      "Schedule created successfully",
      201,
    );
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
    const transformedSchedules = schedules.map(transformSchedule);
    const total = await Schedule.count(status);
    const pagination = getPaginationMeta(page, limit, total);

    paginatedResponse(
      res,
      transformedSchedules,
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

    const transformedSchedule = transformSchedule(schedule);
    successResponse(
      res,
      transformedSchedule,
      "Schedule retrieved successfully",
    );
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
    const transformedSchedule = transformSchedule(updatedSchedule);

    // Emit real-time notification to driver and relevant roles
    emitToUser(schedule.driver_id, "schedule:updated", transformedSchedule);
    emitToRole("scheduler", "schedule:updated", transformedSchedule);

    successResponse(res, transformedSchedule, "Schedule updated successfully");
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
