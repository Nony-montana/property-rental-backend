const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  getAllPropertiesAdmin,
  deleteUser,
  deletePropertyAdmin,
  toggleUserStatus,
  toggleVerified,
  toggleFeatured,
} = require("../controllers/admin.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { isAdmin } = require("../middleware/admin.middleware");

// All admin routes require login + admin role
router.get("/stats", verifyToken, isAdmin, getDashboardStats);
router.get("/users", verifyToken, isAdmin, getAllUsers);
router.get("/properties", verifyToken, isAdmin, getAllPropertiesAdmin);
router.delete("/users/:id", verifyToken, isAdmin, deleteUser);
router.delete("/properties/:id", verifyToken, isAdmin, deletePropertyAdmin);
router.put("/users/:id/toggle-status", verifyToken, isAdmin, toggleUserStatus);
router.put("/users/:id/toggle-verified", verifyToken, isAdmin, toggleVerified);
router.put("/properties/:id/toggle-featured", verifyToken, isAdmin, toggleFeatured);

module.exports = router;