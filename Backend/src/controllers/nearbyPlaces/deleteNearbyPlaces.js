import NearbyPlaces from "../../models/NearbyPlaces.js";

export const deleteNearbyPlaces = async (req, res) => {
  try {
    const nearbyPlaces = await NearbyPlaces.findById(req.params.id);

    if (!nearbyPlaces) {
      return res.status(404).json({ message: "NearbyPlaces not found" });
    }

    nearbyPlaces.isActive = false;
    await nearbyPlaces.save();

    res.json({ message: "NearbyPlaces removed successfully" });
  } catch (error) {
    console.error("Error deleting nearbyPlaces:", error);
    res.status(500).json({ message: "Server error" });
  }
};
