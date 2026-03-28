import NearbyPlaces from "../../models/NearbyPlaces.js";
import cloudinary from "../../config/cloudinary.js";

export const createNearbyPlaces = async (req, res) => {
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
        const result = await cloudinary.uploader.upload(file.path, { folder: "NearbyPlaces" });
        imagesArray.push(result.secure_url);
      }
    }

    const nearbyPlace = await NearbyPlaces.create({
      name,
      isActive: isActive === "true" || isActive === true, // convert string to boolean
      images: imagesArray
    });

    res.status(201).json(nearbyPlace);
  } catch (error) {
    console.error("Error creating nearby place:", error);
    res.status(500).json({ message: "Server error while creating nearby place." });
  }
};
