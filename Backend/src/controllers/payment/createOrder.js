import razorpay from "../../config/razorpay.js";
import Booking from "../../models/Booking.js";

export const createPaymentOrder = async (req, res) => {
  try {
    const { totalAmount, currency = "INR", bookingId } = req.body;

    if (!totalAmount || !bookingId) {
      return res.status(400).json({ message: "Amount & bookingId required" });
    }

    const options = {
      amount: Math.round(Number(totalAmount) * 100),
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        bookingId,
      },
    };

    const order = await razorpay.orders.create(options);

    await Booking.findOneAndUpdate(
      { bookingId },
      { razorpayOrderId: order.id }
    );

    res.status(201).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("RAZORPAY ERROR:", err);
    res.status(500).json({
      message: err?.error?.description || "Failed to create payment order",
    });
  }
};