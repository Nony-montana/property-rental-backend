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
  getAllChatsAdmin,
} = require("../controllers/admin.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { isAdmin } = require("../middleware/admin.middleware");
const { auditLog } = require("../middleware/audit.middleware");

// All admin routes require login + admin role
router.get("/stats", verifyToken, isAdmin, getDashboardStats);
router.get("/users", verifyToken, isAdmin, getAllUsers);
router.get("/properties", verifyToken, isAdmin, getAllPropertiesAdmin);
router.delete("/users/:id", verifyToken, isAdmin, auditLog('DELETE', 'USER'), deleteUser);
router.delete("/properties/:id", verifyToken, isAdmin, auditLog('DELETE', 'PROPERTY'), deletePropertyAdmin);
router.put("/users/:id/toggle-status", verifyToken, isAdmin, auditLog('TOGGLE_STATUS', 'USER'), toggleUserStatus);
router.put("/users/:id/toggle-verified", verifyToken, isAdmin, auditLog('TOGGLE_VERIFIED', 'USER'), toggleVerified);
router.put("/properties/:id/toggle-featured", verifyToken, isAdmin, auditLog('TOGGLE_FEATURED', 'PROPERTY'), toggleFeatured)
router.get("/chats", verifyToken, isAdmin, getAllChatsAdmin);
router.get("/audit-logs", verifyToken, isAdmin, getAuditLogs);

module.exports = router;