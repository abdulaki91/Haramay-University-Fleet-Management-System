const { pool } = require("../config/database");
const { successResponse } = require("../utils/response");

// Vehicle summary report (Admin, Vehicle Manager)
exports.getVehicleSummaryReport = async (req, res, next) => {
  try {
    const [summary] = await pool.query(`
      SELECT 
        COUNT(*) as total_vehicles,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN status = 'in_use' THEN 1 ELSE 0 END) as in_use,
        SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as in_maintenance,
        SUM(CASE WHEN status = 'out_of_service' THEN 1 ELSE 0 END) as out_of_service
      FROM vehicles
    `);

    const [byFuelType] = await pool.query(`
      SELECT fuel_type, COUNT(*) as count
      FROM vehicles
      GROUP BY fuel_type
    `);

    successResponse(
      res,
      {
        summary: summary[0],
        by_fuel_type: byFuelType,
      },
      "Vehicle summary report generated",
    );
  } catch (error) {
    next(error);
  }
};

// Maintenance report (Admin, Vehicle Manager)
exports.getMaintenanceReport = async (req, res, next) => {
  try {
    const [summary] = await pool.query(`
      SELECT 
        COUNT(*) as total_requests,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(estimated_cost) as total_estimated_cost,
        SUM(actual_cost) as total_actual_cost
      FROM maintenance_requests
    `);

    const [byPriority] = await pool.query(`
      SELECT priority, COUNT(*) as count
      FROM maintenance_requests
      GROUP BY priority
    `);

    const [recentRequests] = await pool.query(`
      SELECT mr.*, v.plate_number, 
             CONCAT(u.first_name, ' ', u.last_name) as requested_by_name
      FROM maintenance_requests mr
      JOIN vehicles v ON mr.vehicle_id = v.id
      JOIN users u ON mr.requested_by = u.id
      ORDER BY mr.created_at DESC
      LIMIT 10
    `);

    successResponse(
      res,
      {
        summary: summary[0],
        by_priority: byPriority,
        recent_requests: recentRequests,
      },
      "Maintenance report generated",
    );
  } catch (error) {
    next(error);
  }
};

// Fuel usage report (Admin, Vehicle Manager)
exports.getFuelUsageReport = async (req, res, next) => {
  try {
    const [summary] = await pool.query(`
      SELECT 
        COUNT(*) as total_refuels,
        SUM(fuel_amount) as total_fuel,
        SUM(cost) as total_cost,
        AVG(cost) as average_cost_per_refuel
      FROM fuel_records
    `);

    const [byVehicle] = await pool.query(`
      SELECT 
        v.plate_number,
        v.make,
        v.model,
        COUNT(fr.id) as refuel_count,
        SUM(fr.fuel_amount) as total_fuel,
        SUM(fr.cost) as total_cost
      FROM vehicles v
      LEFT JOIN fuel_records fr ON v.id = fr.vehicle_id
      GROUP BY v.id
      ORDER BY total_cost DESC
      LIMIT 10
    `);

    const [recentRefuels] = await pool.query(`
      SELECT fr.*, v.plate_number,
             CONCAT(u.first_name, ' ', u.last_name) as driver_name
      FROM fuel_records fr
      JOIN vehicles v ON fr.vehicle_id = v.id
      JOIN users u ON fr.driver_id = u.id
      ORDER BY fr.filled_at DESC
      LIMIT 10
    `);

    successResponse(
      res,
      {
        summary: summary[0],
        by_vehicle: byVehicle,
        recent_refuels: recentRefuels,
      },
      "Fuel usage report generated",
    );
  } catch (error) {
    next(error);
  }
};

// System report (Admin only)
exports.getSystemReport = async (req, res, next) => {
  try {
    const [userStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_users
      FROM users
    `);

    const [roleDistribution] = await pool.query(`
      SELECT r.name, COUNT(u.id) as count
      FROM roles r
      LEFT JOIN users u ON r.id = u.role_id
      GROUP BY r.id
    `);

    const [scheduleStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_schedules,
        SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM schedules
    `);

    const [exitRequestStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_requests,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
      FROM exit_requests
    `);

    successResponse(
      res,
      {
        users: userStats[0],
        role_distribution: roleDistribution,
        schedules: scheduleStats[0],
        exit_requests: exitRequestStats[0],
      },
      "System report generated",
    );
  } catch (error) {
    next(error);
  }
};
