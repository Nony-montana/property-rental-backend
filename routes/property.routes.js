const express = require("express");
const router = express.Router();
const {
  createProperty,
  getAllProperties,
  getSingleProperty,
  updateProperty,
  deleteProperty,
  getMyProperties,
    toggleAvailability,
} = require("../controllers/property.controller");
const { verifyToken, isLandlord } = require("../middleware/auth.middleware");
const { upload } = require("../config/cloudinary");


// PUBLIC ROUTES (no login needed)
router.get("/", getAllProperties);
router.get("/my-properties", verifyToken, isLandlord, getMyProperties);
router.get("/:id", getSingleProperty);

// PROTECTED ROUTES (login + landlord only)
router.post("/", verifyToken, isLandlord, upload.array("images", 7), createProperty);
router.put("/:id", verifyToken, isLandlord, upload.array("images", 7), updateProperty);
router.delete("/:id", verifyToken, isLandlord, deleteProperty);
router.put("/:id/toggle-availability", verifyToken, isLandlord, toggleAvailability);

module.exports = router;



