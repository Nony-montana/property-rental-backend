const User = require("../models/user.model");
const Property = require("../models/property.model");
const Chat = require("../models/chat.model");

// GET DASHBOARD STATS
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $ne: "ADMIN" } });
    const totalLandlords = await User.countDocuments({ role: "LANDLORD" });
    const totalTenants = await User.countDocuments({ role: "RENT" });
    const totalBuyers = await User.countDocuments({ role: "BUY" });
    const totalProperties = await Property.countDocuments();
    const availableProperties = await Property.countDocuments({ isAvailable: true });
    const unavailableProperties = await Property.countDocuments({ isAvailable: false });
    const totalChats = await Chat.countDocuments();

    res.status(200).json({
      message: "Stats fetched successfully",
      data: {
        totalUsers,
        totalLandlords,
        totalTenants,
        totalBuyers,
        totalProperties,
        availableProperties,
        unavailableProperties,
        totalChats,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL USERS
const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : { role: { $ne: "ADMIN" } };
    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
    res.status(200).json({ message: "Users fetched successfully", data: users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL PROPERTIES
const getAllPropertiesAdmin = async (req, res) => {
  try {
    const properties = await Property.find()
      .populate("landlord", "firstName lastName email phone")
      .sort({ createdAt: -1 });
    res.status(200).json({ message: "Properties fetched successfully", data: properties });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE USER
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "ADMIN") return res.status(403).json({ message: "Cannot delete admin account" });
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE PROPERTY
const deletePropertyAdmin = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });
    await Property.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// TOGGLE USER ACTIVE STATUS
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "ADMIN") return res.status(403).json({ message: "Cannot deactivate admin account" });

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// TOGGLE LANDLORD VERIFIED STATUS
const toggleVerified = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "LANDLORD") return res.status(400).json({ message: "Only landlords can be verified" });

    user.isVerified = !user.isVerified;
    await user.save();

    res.status(200).json({
      message: `Landlord ${user.isVerified ? 'verified' : 'unverified'} successfully`,
      data: user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// TOGGLE FEATURE PROPERTY
const toggleFeatured = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    property.isFeatured = !property.isFeatured;
    await property.save();

    res.status(200).json({
      message: `Property ${property.isFeatured ? 'featured' : 'unfeatured'} successfully`,
      data: property
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllChatsAdmin = async (req, res) => {
  try {
    const chats = await Chat.find()
      .populate("property", "title")
      .populate("landlord", "firstName lastName email")
      .populate("tenant", "firstName lastName email")
      .sort({ lastMessageTime: -1 });
    res.status(200).json({ message: "Chats fetched", data: chats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllPropertiesAdmin,
  deleteUser,
  deletePropertyAdmin,
  toggleUserStatus,
  toggleVerified,
  toggleFeatured,
  getAllChatsAdmin,
};