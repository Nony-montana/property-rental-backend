const express = require("express");
const router = express.Router();
const {
  createProperty,
  getAllProperties,
  getSingleProperty,
  updateProperty,
  deleteProperty,
  getMyProperties,
} = require("../controllers/property.controller");
const { verifyToken, isLandlord } = require("../middleware/auth.middleware");

// PUBLIC ROUTES (no login needed)
router.get("/", getAllProperties);
router.get("/my-properties", verifyToken, isLandlord, getMyProperties);
router.get("/:id", getSingleProperty);

// PROTECTED ROUTES (login + landlord only)
router.post("/", verifyToken, isLandlord, createProperty);
router.put("/:id", verifyToken, isLandlord, updateProperty);
router.delete("/:id", verifyToken, isLandlord, deleteProperty);

module.exports = router;