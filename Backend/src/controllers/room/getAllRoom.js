import Room from "../../models/Room.js";

export const getAllRoom = async (_, res) => {
  try {
    // Fetch only active rooms
    const rooms = await Room.find({ isActive: true });

    // Optional: format the response if needed
    const formattedRooms = rooms.map(room => ({
      id: room._id,
      name: room.name,
      price: room.price,
      gst: room.gst,
      maxGuest: room.maxGuest,
      amenities: room.amenities,
      description: room.description,
      bookedDates: room.bookedDates,
      holdDates: room.holdDates,
      images: room.images
    }));

    res.status(200).json(formattedRooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ message: "Failed to fetch rooms" });
  }
};
