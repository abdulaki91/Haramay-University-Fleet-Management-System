const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { successResponse, errorResponse } = require("../utils/response");

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

    // Remove password from response
    delete user.password;

    successResponse(
      res,
      {
        token,
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone,
          role: user.role_name,
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
    delete user.password;

    successResponse(res, user, "Profile retrieved successfully");
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
    successResponse(res, null, "Password changed successfully");
  } catch (error) {
    next(error);
  }
};
