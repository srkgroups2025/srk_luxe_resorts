import Booking from "../../models/Booking.js";

export const rejectCancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({
      _id: bookingId,
      status: "CANCEL_REQUESTED",
    });

    if (!booking) {
      return res.status(404).json({
        message: "Cancel request not found",
      });
    }

    booking.status = "BOOKED";
    booking.cancelReason = null;

    await booking.save();

    res.status(200).json({
      message: "Cancel request rejected",
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to reject cancellation" });
  }
};
