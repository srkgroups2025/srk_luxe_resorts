import BG from "../../models/BG.js";
import cloudinary from "../../config/cloudinary.js";

export const createBG = async (req, res) => {
  try {
    const { isActive } = req.body;

    // ✅ Check if image exists
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Please upload image" });
    }

    // Upload images to Cloudinary
    let imagesArray = [];
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, { folder: "bg" });
      imagesArray.push(result.secure_url);
    }

    const bg = await BG.create({
      isActive: isActive === "true" || isActive === true,
      images: imagesArray
    });

    res.status(201).json({
      message: "BG created successfully",
      data: bg,
    });
  } catch (error) {
    console.error("Error creating bg:", error);
    res.status(500).json({ message: "Server error while creating bg." });
  }
};
