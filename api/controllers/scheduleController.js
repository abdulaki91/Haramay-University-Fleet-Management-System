const Schedule = require("../models/Schedule");
const Vehicle = require("../models/Vehicle");
const User = require("../models/User");
const NotificationService = require("../services/notificationService");
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
    const {
      vehicleId,
      vehicle_id,
      driverId,
      driver_id,
      purpose,
      destination,
      departureTime,
      start_date,
      returnTime,
      end_date,
      passengers,
      notes,
    } = req.body;

    const finalData = {
      vehicle_id: vehicleId || vehicle_id,
      driver_id: driverId || driver_id,
      purpose,
      destination,
      start_date: departureTime || start_date,
      end_date: returnTime || end_date,
      passengers,
      notes,
      created_by: req.user.id,
    };

    // Verify vehicle exists
    const vehicle = await Vehicle.findById(finalData.vehicle_id);
    if (!vehicle) {
      return errorResponse(res, "Vehicle not found", 404);
    }

    // Verify driver exists
    const driver = await User.findById(finalData.driver_id);
    if (!driver) {
      return errorResponse(res, "Driver not found", 404);
    }

    const scheduleId = await Schedule.create(finalData);

    const schedule = await Schedule.findById(scheduleId);
    const transformedSchedule = transformSchedule(schedule);

    // Send notification to assigned driver
    await NotificationService.notifyScheduleAssignment(
      scheduleId,
      finalData.driver_id,
      req.user.id,
    );

    // Emit real-time notification to driver
    emitToUser(finalData.driver_id, "schedule:created", transformedSchedule);
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

    let schedules = await Schedule.findAll(limit, offset, status);

    // Filter schedules for drivers - only show their own schedules
    if (req.user.role_name === "driver") {
      schedules = schedules.filter((s) => s.driver_id === req.user.id);
    }

    const transformedSchedules = schedules.map(transformSchedule);

    // Adjust total count for drivers
    let total;
    if (req.user.role_name === "driver") {
      total = transformedSchedules.length;
    } else {
      total = await Schedule.count(status);
    }

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
    const body = req.body;

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return errorResponse(res, "Schedule not found", 404);
    }

    // Map frontend fields to database columns
    const updateData = {};
    if (body.vehicleId !== undefined || body.vehicle_id !== undefined)
      updateData.vehicle_id = body.vehicleId ?? body.vehicle_id;
    if (body.driverId !== undefined || body.driver_id !== undefined)
      updateData.driver_id = body.driverId ?? body.driver_id;
    if (body.destination !== undefined) updateData.destination = body.destination;
    if (body.purpose !== undefined) updateData.purpose = body.purpose;
    if (body.departureTime !== undefined || body.start_date !== undefined)
      updateData.start_date = body.departureTime ?? body.start_date;
    if (body.returnTime !== undefined || body.end_date !== undefined)
      updateData.end_date = body.returnTime ?? body.end_date;
    if (body.passengers !== undefined) updateData.passengers = body.passengers;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes;

    if (Object.keys(updateData).length > 0) {
      await Schedule.update(scheduleId, updateData);
    }

    const updatedSchedule = await Schedule.findById(scheduleId);
    const transformedSchedule = transformSchedule(updatedSchedule);

    // Send notification if driver changed
    const newDriverId = updateData.driver_id;
    if (newDriverId && String(newDriverId) !== String(schedule.driver_id)) {
      await NotificationService.createNotification({
        type: "schedule_updated",
        title: "Schedule Updated",
        message: `Your schedule has been updated: ${updateData.purpose || schedule.purpose} to ${updateData.destination || schedule.destination}.`,
        priority: "medium",
        targetUsers: [newDriverId],
        metadata: {
          schedule_id: scheduleId,
          changes: "Driver assignment updated",
        },
        createdBy: req.user.id,
      });
    }

    // Emit real-time notification to original driver and relevant roles
    emitToUser(schedule.driver_id, "schedule:updated", transformedSchedule);
    emitToRole("scheduler", "schedule:updated", transformedSchedule);

    // If driver changed, also notify the new driver
    if (newDriverId && String(newDriverId) !== String(schedule.driver_id)) {
      emitToUser(newDriverId, "schedule:updated", transformedSchedule);
    }

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
