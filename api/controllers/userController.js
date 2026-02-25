const User = require("../models/User");
const Role = require("../models/Role");
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require("../utils/response");
const { getPagination, getPaginationMeta } = require("../utils/pagination");

// Create user (Admin only)
exports.createUser = async (req, res, next) => {
  try {
    const { first_name, last_name, email, password, phone, role_id } = req.body;

    // Check if email already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return errorResponse(res, "Email already exists", 409);
    }

    // Verify role exists
    const role = await Role.findById(role_id);
    if (!role) {
      return errorResponse(res, "Invalid role ID", 400);
    }

    const userId = await User.create({
      first_name,
      last_name,
      email,
      password,
      phone,
      role_id,
    });
    const user = await User.findById(userId);

    successResponse(res, user, "User created successfully", 201);
  } catch (error) {
    next(error);
  }
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req);

    const users = await User.findAll(limit, offset);
    const total = await User.count();
    const pagination = getPaginationMeta(page, limit, total);

    paginatedResponse(res, users, pagination, "Users retrieved successfully");
  } catch (error) {
    next(error);
  }
};

// Get user by ID
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    successResponse(res, user, "User retrieved successfully");
  } catch (error) {
    next(error);
  }
};

// Update user (Admin only)
exports.updateUser = async (req, res, next) => {
  try {
    const { first_name, last_name, email, phone, is_active } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return errorResponse(res, "Email already exists", 409);
      }
    }

    await User.update(userId, {
      first_name,
      last_name,
      email,
      phone,
      is_active,
    });
    const updatedUser = await User.findById(userId);

    successResponse(res, updatedUser, "User updated successfully");
  } catch (error) {
    next(error);
  }
};

// Delete user (Admin only)
exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Prevent deleting own account
    if (userId == req.user.id) {
      return errorResponse(res, "Cannot delete your own account", 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    await User.delete(userId);
    successResponse(res, null, "User deleted successfully");
  } catch (error) {
    next(error);
  }
};

// Assign role to user (Admin only)
exports.assignRole = async (req, res, next) => {
  try {
    const { role_id } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    const role = await Role.findById(role_id);
    if (!role) {
      return errorResponse(res, "Invalid role ID", 400);
    }

    await User.update(userId, { role_id });
    const updatedUser = await User.findById(userId);

    successResponse(res, updatedUser, "Role assigned successfully");
  } catch (error) {
    next(error);
  }
};

// Get all roles
exports.getRoles = async (req, res, next) => {
  try {
    const roles = await Role.findAll();
    successResponse(res, roles, "Roles retrieved successfully");
  } catch (error) {
    next(error);
  }
};
