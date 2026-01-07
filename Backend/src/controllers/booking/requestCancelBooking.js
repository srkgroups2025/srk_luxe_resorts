import Booking from "../../models/Booking.js";

export const requestCancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    const userEmail = req.user.email;

    const booking = await Booking.findOne({
      bookingId: bookingId,
      "guest.email": userEmail,
      status: "BOOKED",
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found or cannot be cancelled",
      });
    }

    booking.status = "CANCEL_REQUESTED";
    booking.cancelReason = reason || null;

    await booking.save();

    res.status(200).json({
      message: "Cancel request sent to admin",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Cancel request failed" });
  }
};
