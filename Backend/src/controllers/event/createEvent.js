import Event from "../../models/Event.js";
import cloudinary from "../../config/cloudinary.js";

export const createEvent = async (req, res) => {
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
        const result = await cloudinary.uploader.upload(file.path, { folder: "Event" });
        imagesArray.push(result.secure_url);
      }
    }

    const event = await Event.create({
      name,
      isActive: isActive === "true" || isActive === true, // convert string to boolean
      images: imagesArray
    });

    res.status(201).json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Server error while creating event." });
  }
};
