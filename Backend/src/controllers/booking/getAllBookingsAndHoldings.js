import Booking from "../../models/Booking.js";

export const getAllBookingsAndHoldings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      status: { $in: ["BOOKED", "HOLD", "CANCEL_REQUESTED", "CANCELLED"] },
    })
      .populate("roomId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

