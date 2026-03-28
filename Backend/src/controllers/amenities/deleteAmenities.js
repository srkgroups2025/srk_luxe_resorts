import Amenities from "../../models/Amenities.js";

export const deleteAmenities = async (req, res) => {
  try {
    const amenities = await Amenities.findById(req.params.id);

    if (!amenities) {
      return res.status(404).json({ message: "Amenities not found" });
    }

    amenities.isActive = false;
    await amenities.save();

    res.json({ message: "Amenities removed successfully" });
  } catch (error) {
    console.error("Error deleting amenities:", error);
    res.status(500).json({ message: "Server error" });
  }
};
