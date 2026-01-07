import Room from "../../models/Room.js";
import cloudinary from "../../config/cloudinary.js";

export const updateRoom = async (req, res) => {
  try {
    const {
      name,
      price,
      gst,
      maxGuest,
      amenities,
      description,
      bookedDates,
      isActive,
      removedImages
    } = req.body;

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    /* ---------- UPDATE BASIC FIELDS ---------- */
    if (name !== undefined) room.name = name;
    if (price !== undefined) room.price = price;
    if (gst !== undefined) room.gst = gst;
    if (maxGuest !== undefined) room.maxGuest = maxGuest;
    if (description !== undefined) room.description = description;
    if (bookedDates !== undefined) room.bookedDates = bookedDates;
    if (typeof isActive === "string") {
      room.isActive = isActive === "true";
    }

    if (amenities) {
      room.amenities = JSON.parse(amenities);
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

      room.images = room.images.filter(
        (img) => !imagesToRemove.includes(img)
      );
    }

    /* ---------- ADD NEW IMAGES ---------- */
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "rooms",
        });

        room.images.push(result.secure_url);
      }
    }

    await room.save();

    res.status(200).json(room);
  } catch (error) {
    console.error("Error updating room:", error);
    res.status(500).json({ message: "Server error" });
  }
};
