const Property = require("../models/property.model");

const { cloudinary } = require("../config/cloudinary");

const createProperty = async (req, res) => {
  try {
    const { title, description, price, propertyType, bedrooms, bathrooms } = req.body;

    const location = {
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
    };

    const imageUrls = req.files ? req.files.map((file) => file.path) : [];

    const property = await Property.create({
      title,
      description,
      price,
      location,
      propertyType,
      images: imageUrls,
      bedrooms,
      bathrooms,
      landlord: req.user.id,
    });

    res.status(201).json({ message: "Property created successfully", data: property });
  } catch (error) {
    console.log("ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};
// GET ALL PROPERTIES (everyone can see)
const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find({ isAvailable: true }).populate("landlord", "firstName lastName email phone isVerified")

    res
      .status(200)
      .json({ message: "Properties fetched successfully", data: properties });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET A SINGLE PROPERTY
const getSingleProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate("landlord", "firstName lastName email phone isVerified")

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res
      .status(200)
      .json({ message: "Property fetched successfully", data: property });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET LANDLORD'S OWN PROPERTIES
const getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ landlord: req.user.id });
    res
      .status(200)
      .json({ message: "Properties fetched successfully", data: properties });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE A PROPERTY (only the landlord who posted it)
const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (property.landlord.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You can only update your own properties" });
    }

    const updated = await Property.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
    });

    res
      .status(200)
      .json({ message: "Property updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE A PROPERTY (only the landlord who posted it)
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (property.landlord.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You can only delete your own properties" });
    }

    await Property.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// TOGGLE PROPERTY AVAILABILITY
const toggleAvailability = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (property.landlord.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only update your own properties" });
    }

    property.isAvailable = !property.isAvailable;
    await property.save();

    res.status(200).json({
      message: `Property marked as ${property.isAvailable ? 'available' : 'unavailable'}`,
      data: property
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



module.exports = {
  createProperty,
  getAllProperties,
  getSingleProperty,
  updateProperty,
  deleteProperty,
  getMyProperties,
  toggleAvailability,
};
