import Room from "../../models/Room.js";
import cloudinary from "../../config/cloudinary.js";

export const createRoom = async (req, res) => {
  try {
    const {
      name,
      price,
      gst,
      maxGuest,
      amenities,
      description,
      bookedDates = [],
      isActive
    } = req.body;

    // Validate required fields
    if (!name || !price || !gst || !maxGuest || !description) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    // Parse amenities (sent as JSON string from frontend)
    const amenitiesArray = amenities ? JSON.parse(amenities) : [];

    // Upload images to Cloudinary
    let imagesArray = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, { folder: "rooms" });
        imagesArray.push(result.secure_url);
      }
    }

    const room = await Room.create({
      name,
      price,
      gst,
      maxGuest,
      amenities: amenitiesArray,
      description,
      bookedDates,
      isActive: isActive === "true" || isActive === true, // convert string to boolean
      images: imagesArray
    });

    res.status(201).json(room);
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ message: "Server error while creating room." });
  }
};
