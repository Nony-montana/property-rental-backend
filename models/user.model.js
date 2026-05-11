const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["LANDLORD", "BUY", "RENT", "ADMIN"], default: "RENT" },
  phone: { type: String },
  avatar: { type: String },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);