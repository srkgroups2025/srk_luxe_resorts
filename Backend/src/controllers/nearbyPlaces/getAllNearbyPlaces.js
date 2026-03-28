import NearbyPlaces from "../../models/NearbyPlaces.js";

export const getAllNearbyPlaces = async (_, res) => {
  try {
    // Fetch only active nearby places
    const nearbyPlaces = await NearbyPlaces.find({ isActive: true });

    // Optional: format the response if needed
    const formattedNearbyPlaces = nearbyPlaces.map(nearbyPlace => ({
      id: nearbyPlace._id,
      name: nearbyPlace.name,
      images: nearbyPlace.images
    }));

    res.status(200).json(formattedNearbyPlaces);
  } catch (error) {
    console.error("Error fetching nearby places:", error);
    res.status(500).json({ message: "Failed to fetch nearby places" });
  }
};
