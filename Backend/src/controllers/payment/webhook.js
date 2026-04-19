import express from "express";
import crypto from "crypto";
import Booking from "../../models/Booking.js";
import { confirmBookingService } from "../../services/booking.service.js";

const router = express.Router();

router.post(
  "/razorpay-webhook",
  express.raw({ type: "application/json" }), // ✅ VERY IMPORTANT
  async (req, res) => {
    try {
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

      const signature = req.headers["x-razorpay-signature"];

      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(req.body) // ✅ raw body
        .digest("hex");

      // ❌ Invalid signature
      if (signature !== expectedSignature) {
        return res.status(400).json({ message: "Invalid webhook signature" });
      }

      const event = JSON.parse(req.body.toString());

      /* ---------------- PAYMENT SUCCESS ---------------- */
      if (event.event === "payment.captured") {
        const payment = event.payload.payment.entity;

        const bookingId = payment.notes.bookingId;

        if (!bookingId) {
          return res.status(400).json({ message: "BookingId missing in notes" });
        }

        await confirmBookingService(bookingId);

        return res.status(200).json({ success: true });
      }

      /* ---------------- PAYMENT FAILED ---------------- */
      if (event.event === "payment.failed") {
        const payment = event.payload.payment.entity;

        const bookingId = payment.notes.bookingId;

        if (bookingId) {
          await Booking.findOneAndUpdate(
            { bookingId },
            {
              paymentStatus: "FAILED",
              status: "CANCELLED",
            }
          );
        }

        return res.status(200).json({ success: true });
      }

      return res.status(200).json({ received: true });

    } catch (err) {
      console.error("Webhook Error:", err);
      return res.status(500).json({ message: "Webhook processing failed" });
    }
  }
);

export default router;