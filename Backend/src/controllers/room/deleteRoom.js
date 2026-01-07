import Room from "../../models/Room.js";

export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Check if room has active bookings
    if (room.bookedDates && room.bookedDates.length > 0) {
      return res.status(400).json({ 
        message: "Cannot delete room with active bookings" 
      });
    }

    // Check if room has active holdings
    if (room.holdDates && room.holdDates.length > 0) {
      return res.status(400).json({ 
        message: "Cannot delete room with active holdings" 
      });
    }

    room.isActive = false;
    await room.save();

    res.json({ message: "Room removed successfully" });
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).json({ message: "Server error" });
  }
};
