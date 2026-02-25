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
    authorize("admin"),
    body("first_name").notEmpty().withMessage("First name is required"),
    body("last_name").notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role_id").isInt().withMessage("Valid role ID is required"),
    validate,
  ],
  userController.createUser,
);

// Get all users (Admin only)
router.get("/", authenticate, authorize("admin"), userController.getAllUsers);

// Get user by ID (Admin only)
router.get(
  "/:id",
  authenticate,
  authorize("admin"),
  userController.getUserById,
);

// Update user (Admin only)
router.put(
  "/:id",
  [
    authenticate,
    authorize("admin"),
    body("email").optional().isEmail().withMessage("Valid email is required"),
    validate,
  ],
  userController.updateUser,
);

// Delete user (Admin only)
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  userController.deleteUser,
);

// Assign role (Admin only)
router.put(
  "/:id/role",
  [
    authenticate,
    authorize("admin"),
    body("role_id").isInt().withMessage("Valid role ID is required"),
    validate,
  ],
  userController.assignRole,
);

module.exports = router;
