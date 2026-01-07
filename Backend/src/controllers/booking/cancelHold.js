import Booking from "../../models/Booking.js";
import Room from "../../models/Room.js";
import { getDatesBetween } from "./getDatesBetween.js";

export const cancelHold = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking)
      return res.status(404).json({ message: "Hold not found" });

    if (booking.status !== "HOLD")
      return res.status(400).json({ message: "Not a hold booking" });

    const room = await Room.findById(booking.roomId);

    // Normalize getDatesBetween output to YYYY-MM-DD strings
    const cancelDates = getDatesBetween(booking.checkIn, booking.checkOut).map((d) => {
      if (d instanceof Date) return d.toISOString().split("T")[0];
      if (typeof d === "string") return d.split("T")[0];
      throw new Error("Invalid date in getDatesBetween");
    });

    // Filter room.holdDates safely
    room.holdDates = room.holdDates.filter((d) => {
      const dateStr = typeof d === "string" ? d.split("T")[0] : d.toISOString().split("T")[0];
      return !cancelDates.includes(dateStr);
    });

    booking.status = "CANCELLED";

    await room.save();
    await booking.save();

    res.status(200).json({ message: "Hold cancelled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Cancel hold failed" });
  }
};

