const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const userController = require("../controllers/userController");
const { authenticate, authorize } = require("../middlewares/auth");
const validate = require("../middlewares/validate");

// Get all roles (authenticated users)
router.get("/roles", authenticate, userController.getRoles);

// Create user (Admin only)
router.post(
  "/",
  [
    authenticate,
    authorize("system_admin"),
    // Accept both camelCase and snake_case
    body().custom((value, { req }) => {
      console.log("User validation - Request body:", req.body);

      // Check for fullName or first_name/last_name
      if (!req.body.fullName && (!req.body.first_name || !req.body.last_name)) {
        throw new Error("Full name or first name and last name are required");
      }

      if (!req.body.username) {
        throw new Error("Username is required");
      }

      if (!req.body.email) {
        throw new Error("Email is required");
      }

      // Check for role or role_id
      if (!req.body.role && !req.body.role_id && !req.body.roleId) {
        throw new Error("Role is required");
      }

      return true;
    }),
    validate,
  ],
  userController.createUser,
);

// Get all users (Admin, Scheduler - for driver selection)
router.get(
  "/",
  authenticate,
  authorize("system_admin", "scheduler"),
  userController.getAllUsers,
);

// Get user by ID (Admin only)
router.get(
  "/:id",
  authenticate,
  authorize("system_admin"),
  userController.getUserById,
);

// Update user (Admin only)
router.put(
  "/:id",
  [
    authenticate,
    authorize("system_admin"),
    body("email").optional().isEmail().withMessage("Valid email is required"),
    validate,
  ],
  userController.updateUser,
);

// Delete user (Admin only)
router.delete(
  "/:id",
  authenticate,
  authorize("system_admin"),
  userController.deleteUser,
);

// Assign role (Admin only)
router.put(
  "/:id/role",
  [
    authenticate,
    authorize("system_admin"),
    body("role_id").isInt().withMessage("Valid role ID is required"),
    validate,
  ],
  userController.assignRole,
);

module.exports = router;
