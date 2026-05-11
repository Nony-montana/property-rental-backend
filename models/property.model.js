const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
  },
  propertyType: {
    type: String,
    enum: ["apartment", "house", "duplex", "studio", "selfcon"],
    required: true,
  },
  images: [{ type: String }],
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isAvailable: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  bedrooms: { type: Number },
  bathrooms: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model("Property", propertySchema);