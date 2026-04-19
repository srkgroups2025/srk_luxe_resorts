import crypto from "crypto";
import Booking from "../../models/Booking.js";
import { confirmBookingService } from "../../services/booking.service.js";

export const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, guest } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: "Payment details are required" });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // ✅ STEP 1: FIND BOOKING
    const booking = await Booking.findOne({ razorpayOrderId });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // ✅ STEP 2: IDEMPOTENCY CHECK (🔥 IMPORTANT)
    if (booking.status === "BOOKED") {
      return res.status(200).json({ message: "Already confirmed" });
    }

    // ✅ STEP 3: UPDATE PAYMENT & CONFIRM BOOKING
    booking.paymentStatus = "SUCCESS";
    booking.razorpayPaymentId = razorpayPaymentId;

    await booking.save();

    // ✅ STEP 4: CONFIRM BOOKING (update status to BOOKED, add dates to room, send email)
    // 🔥 Pass guest details to confirmBookingService
    await confirmBookingService(booking.bookingId, guest);

    return res.status(200).json({
      message: "Payment verified & booking confirmed",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Payment verification failed" });
  }
};