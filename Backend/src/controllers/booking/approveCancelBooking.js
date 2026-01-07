import Booking from "../../models/Booking.js";
import Room from "../../models/Room.js";
import { getDatesBetween } from "./getDatesBetween.js";

export const approveCancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({
      _id: bookingId,
      status: "CANCEL_REQUESTED",
    });

    if (!booking) {
      return res.status(404).json({ message: "Cancel request not found" });
    }

    const room = await Room.findById(booking.roomId);

    if (room) {
      const cancelDates = getDatesBetween(booking.checkIn, booking.checkOut).map((d) => {
        if (d instanceof Date) return d.toISOString().split("T")[0];
        if (typeof d === "string") return d.split("T")[0];
        throw new Error("Invalid date in getDatesBetween");
      });

      room.bookedDates = room.bookedDates.filter((d) => {
        const dateStr = typeof d === "string" ? d.split("T")[0] : d.toISOString().split("T")[0];
        return !cancelDates.includes(dateStr);
      });

      await room.save();
    }

    booking.status = "CANCELLED";
    await booking.save();

    res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to approve cancellation" });
  }
};

