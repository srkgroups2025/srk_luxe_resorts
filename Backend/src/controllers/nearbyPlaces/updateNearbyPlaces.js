import NearbyPlaces from "../../models/NearbyPlaces.js";
import cloudinary from "../../config/cloudinary.js";

export const updateNearbyPlaces = async (req, res) => {
  try {
    const {
      name,
      isActive,
      removedImages
    } = req.body;

    const nearbyPlaces = await NearbyPlaces.findById(req.params.id);
    if (!nearbyPlaces) {
      return res.status(404).json({ message: "NearbyPlaces not found" });
    }

    /* ---------- UPDATE BASIC FIELDS ---------- */
    if (name !== undefined) nearbyPlaces.name = name;
    if (typeof isActive === "string") {
      nearbyPlaces.isActive = isActive === "true";
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

      nearbyPlaces.images = nearbyPlaces.images.filter(
        (img) => !imagesToRemove.includes(img)
      );
    }

    /* ---------- ADD NEW IMAGES ---------- */
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "NearbyPlaces",
        });

        nearbyPlaces.images.push(result.secure_url);
      }
    }

    await nearbyPlaces.save();

    res.status(200).json({
        message: "NearbyPlaces updated successfully",
        data: nearbyPlaces,
    });
  } catch (error) {
    console.error("Error updating nearbyPlaces:", error);
    res.status(500).json({ message: "Server error" });
  }
};
