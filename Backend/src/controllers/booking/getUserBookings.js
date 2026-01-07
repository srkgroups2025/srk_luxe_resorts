import Booking from "../../models/Booking.js";

export const getUserBookings = async (req, res) => {
  try {
    const userEmail = req.user.email; // from auth middleware

    const bookings = await Booking.find({
      "guest.email": userEmail,
      status: { $ne: "CANCELLED" },
    })
      .populate("roomId", "name price images") // optional
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};
