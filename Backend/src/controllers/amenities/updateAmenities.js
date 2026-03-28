import Amenities from "../../models/Amenities.js";
import cloudinary from "../../config/cloudinary.js";

export const updateAmenities = async (req, res) => {
  try {
    const {
      name,
      isActive,
      removedImages
    } = req.body;

    const amenities = await Amenities.findById(req.params.id);
    if (!amenities) {
      return res.status(404).json({ message: "Amenities not found" });
    }

    /* ---------- UPDATE BASIC FIELDS ---------- */
    if (name !== undefined) amenities.name = name;
    if (typeof isActive === "string") {
      amenities.isActive = isActive === "true";
    }

    /* ---------- REMOVE OLD IMAGES ---------- */
    if (removedImages) {
      const imagesToRemove = JSON.parse(removedImages);

      for (const imageUrl of imagesToRemove) {
        const publicId = imageUrl
          .split("/")
          .slice(-2)
          .join("/")
          .split(".")[0];

        await cloudinary.uploader.destroy(publicId);
      }

      amenities.images = amenities.images.filter(
        (img) => !imagesToRemove.includes(img)
      );
    }

    /* ---------- ADD NEW IMAGES ---------- */
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "Amenities",
        });

        amenities.images.push(result.secure_url);
      }
    }

    await amenities.save();

    res.status(200).json({
        message: "Amenities updated successfully",
        data: amenities,
    });
  } catch (error) {
    console.error("Error updating amenities:", error);
    res.status(500).json({ message: "Server error" });
  }
};
