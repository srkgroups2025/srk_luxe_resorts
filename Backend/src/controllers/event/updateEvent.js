import Event from "../../models/Event.js";
import cloudinary from "../../config/cloudinary.js";

export const updateEvent = async (req, res) => {
  try {
    const {
      name,
      isActive,
      removedImages
    } = req.body;

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    /* ---------- UPDATE BASIC FIELDS ---------- */
    if (name !== undefined) event.name = name;
    if (typeof isActive === "string") {
      event.isActive = isActive === "true";
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

      event.images = event.images.filter(
        (img) => !imagesToRemove.includes(img)
      );
    }

    /* ---------- ADD NEW IMAGES ---------- */
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "Event",
        });

        event.images.push(result.secure_url);
      }
    }

    await event.save();

    res.status(200).json(event);
        res.status(200).json({
        message: "Event updated successfully",
        data: event,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Server error" });
  }
};
