const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
 role: { type: String, enum: ["LANDLORD", "BUY", "RENT"], default: "RENT" },
  phone: { type: String },
  avatar: { type: String },
}, { timestamps: true });


module.exports = mongoose.model("User", userSchema);