import Amenities from "../../models/Amenities.js";

export const getAllAmenities = async (_, res) => {
  try {
    // Fetch only active amenities
    const amenities = await Amenities.find({ isActive: true });

    // Optional: format the response if needed
    const formattedRooms = amenities.map(amenities => ({
      id: amenities._id,
      name: amenities.name,
      images: amenities.images
    }));

    res.status(200).json(formattedRooms);
  } catch (error) {
    console.error("Error fetching amenities:", error);
    res.status(500).json({ message: "Failed to fetch amenities" });
  }
};
