import Booking from "../../models/Booking.js";

export const getExpiredBookingsAndHoldings = async (req, res) => {
  try {
    const expired = await Booking.find({
      status: "EXPIRED",
    })
      .populate("roomId")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      count: expired.length,
      data: expired,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch expired bookings" });
  }
};

