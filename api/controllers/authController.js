const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { successResponse, errorResponse } = require("../utils/response");
const { transformUser } = require("../utils/transformer");

// Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return errorResponse(res, "Invalid email or password", 401);
    }

    // Check if account is active
    if (!user.is_active) {
      return errorResponse(
        res,
        "Account is inactive. Contact administrator.",
        403,
      );
    }

    // Verify password
    const isValidPassword = await User.comparePassword(password, user.password);
    if (!isValidPassword) {
      return errorResponse(res, "Invalid email or password", 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role_name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" },
    );

    // Transform user data for frontend
    const transformedUser = transformUser(user);

    successResponse(
      res,
      {
        token,
        user: {
          ...transformedUser,
          passwordChanged: user.password_changed || false,
        },
      },
      "Login successful",
    );
  } catch (error) {
    next(error);
  }
};

// Get current user profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const transformedUser = transformUser(user);

    successResponse(res, transformedUser, "Profile retrieved successfully");
  } catch (error) {
    next(error);
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;

    const user = await User.findByEmail(req.user.email);
    const isValidPassword = await User.comparePassword(
      current_password,
      user.password,
    );

    if (!isValidPassword) {
      return errorResponse(res, "Current password is incorrect", 400);
    }

    await User.updatePassword(req.user.id, new_password);

    // Mark password as changed
    await User.markPasswordChanged(req.user.id);

    successResponse(res, null, "Password changed successfully");
  } catch (error) {
    next(error);
  }
};
