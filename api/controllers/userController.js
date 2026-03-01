const User = require("../models/User");
const Role = require("../models/Role");
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require("../utils/response");
const { getPagination, getPaginationMeta } = require("../utils/pagination");
const { transformUser, transformUserToDb } = require("../utils/transformer");

// Create user (Admin only)
exports.createUser = async (req, res, next) => {
  try {
    console.log("Create user request body:", req.body);

    const userData = req.body;

    // Transform from frontend format if needed
    const dbData = userData.fullName ? transformUserToDb(userData) : userData;

    console.log("Transformed user data:", dbData);

    // Get role_id from role name if provided
    let role_id = userData.role_id || userData.roleId;

    if (!role_id && userData.role) {
      // Frontend sent role name, need to get role_id
      const role = await Role.findByName(userData.role);
      if (!role) {
        return errorResponse(res, `Invalid role: ${userData.role}`, 400);
      }
      role_id = role.id;
    }

    // Ensure we have required fields
    const { first_name, last_name, username, email, phone } = {
      ...dbData,
      username: dbData.username || userData.username,
    };

    // Generate default password if not provided
    const password = userData.password || `${username}@123`;

    console.log("Final user data:", {
      first_name,
      last_name,
      username,
      email,
      phone,
      role_id,
      password: "[HIDDEN]",
    });

    // Validate required fields
    if (!first_name || !last_name) {
      return errorResponse(res, "First name and last name are required", 400);
    }
    if (!username) {
      return errorResponse(res, "Username is required", 400);
    }
    if (!email) {
      return errorResponse(res, "Email is required", 400);
    }
    if (!role_id) {
      return errorResponse(res, "Role is required", 400);
    }

    // Check if email already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return errorResponse(res, "Email already exists", 409);
    }

    // Check if username already exists
    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      return errorResponse(res, "Username already exists", 409);
    }

    // Verify role exists
    const role = await Role.findById(role_id);
    if (!role) {
      return errorResponse(res, "Invalid role ID", 400);
    }

    const userId = await User.create({
      first_name,
      last_name,
      username,
      email,
      password,
      phone,
      role_id,
    });
    const user = await User.findById(userId);
    const transformedUser = transformUser(user);

    console.log("User created successfully:", transformedUser);

    successResponse(res, transformedUser, "User created successfully", 201);
  } catch (error) {
    console.error("User creation error:", error);
    next(error);
  }
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req);

    const users = await User.findAll(limit, offset);
    const transformedUsers = users.map(transformUser);
    const total = await User.count();
    const pagination = getPaginationMeta(page, limit, total);

    paginatedResponse(
      res,
      transformedUsers,
      pagination,
      "Users retrieved successfully",
    );
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

    const transformedUser = transformUser(user);
    successResponse(res, transformedUser, "User retrieved successfully");
  } catch (error) {
    next(error);
  }
};

// Update user (Admin only)
exports.updateUser = async (req, res, next) => {
  try {
    console.log("Update user request body:", req.body);

    const userId = req.params.id;
    const userData = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    // Transform from frontend format if needed
    const dbData = userData.fullName ? transformUserToDb(userData) : userData;

    const { first_name, last_name, email, phone, is_active } = {
      ...dbData,
      first_name: dbData.first_name || userData.firstName,
      last_name: dbData.last_name || userData.lastName,
      email: userData.email,
      phone: userData.phone,
      is_active:
        userData.isActive !== undefined
          ? userData.isActive
            ? 1
            : 0
          : undefined,
    };

    console.log("Update data:", {
      first_name,
      last_name,
      email,
      phone,
      is_active,
    });

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
    const transformedUser = transformUser(updatedUser);

    console.log("User updated successfully:", transformedUser);

    successResponse(res, transformedUser, "User updated successfully");
  } catch (error) {
    console.error("User update error:", error);
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
    const transformedUser = transformUser(updatedUser);

    successResponse(res, transformedUser, "Role assigned successfully");
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
