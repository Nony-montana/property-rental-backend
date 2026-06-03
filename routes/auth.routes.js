const express = require("express");
const router = express.Router();
const { register, login, requestOTP, resetPassword, changePassword, logoutUser } = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.post("/register", register);
router.post("/login", login);
router.post("/request-otp", requestOTP);
router.post("/reset-password", resetPassword)
router.post("/change-password", verifyToken, changePassword);
router.post("/logout", logoutUser);

module.exports = router;

