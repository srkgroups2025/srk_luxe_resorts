import Amenities from "../../models/Amenities.js";
import cloudinary from "../../config/cloudinary.js";

export const createAmenities = async (req, res) => {
  try {
    const {
      name,
      isActive
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    // Upload images to Cloudinary
    let imagesArray = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, { folder: "amenities" });
        imagesArray.push(result.secure_url);
      }
    }

    const amenities = await Amenities.create({
      name,
      isActive: isActive === "true" || isActive === true, // convert string to boolean
      images: imagesArray
    });

    res.status(201).json(amenities);
  } catch (error) {
    console.error("Error creating amenities:", error);
    res.status(500).json({ message: "Server error while creating amenities." });
  }
};
