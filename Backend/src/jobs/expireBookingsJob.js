import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import User from "../models/User.js";
import { getDatesBetween } from "../controllers/booking/getDatesBetween.js";
import { sendReviewMail } from "../controllers/auth/sendEmail.js";

/* ---------------- HELPERS ---------------- */

// Check if current time is after 12 PM of a given date
const isAfter12PM = (date) => {
  const now = new Date();
  const noon = new Date(date);
  noon.setHours(12, 0, 0, 0);
  return now >= noon;
};

// Convert any date to YYYY-MM-DD
const toDateString = (d) => {
  const dateObj = d instanceof Date ? d : new Date(d);
  return dateObj.toISOString().split("T")[0];
};

// Check if a date is before today
const isPastDate = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);

  return date < today;
};

// Check if pending payment exceeded 5 minutes
const isExpiredPending = (createdAt) => {
  return Date.now() - new Date(createdAt).getTime() > 5 * 60 * 1000;
};

/* ---------------- CRON JOB ---------------- */

export const expireBookingsJob = async () => {
  try {
    const bookings = await Booking.find({
      status: { $in: ["PENDING_PAYMENT", "HOLD", "BOOKED"] },
    });

    for (const booking of bookings) {
      const room = await Room.findById(booking.roomId);
      if (!room) continue;

      /* =========================
         CLEANUP RULE
         Remove past dates globally
      ========================== */
      room.holdDates = room.holdDates.filter(
        (d) => !isPastDate(toDateString(d))
      );

      room.bookedDates = room.bookedDates.filter(
        (d) => !isPastDate(toDateString(d))
      );

      /* =========================
         BOOKING DATE RANGE
      ========================== */
      const bookingDates = getDatesBetween(
        booking.checkIn,
        booking.checkOut
      ).map(toDateString);

      /* =========================
         RULE 0: PENDING_PAYMENT → DELETE (5 mins)
      ========================== */
      if (
        booking.status === "PENDING_PAYMENT" &&
        isExpiredPending(booking.createdAt)
      ) {
        room.holdDates = room.holdDates.filter(
          (d) => !bookingDates.includes(toDateString(d))
        );

        await room.save();
        await booking.deleteOne();
        continue;
      }

      /* =========================
         RULE 1: HOLD → EXPIRED
         Check-in day after 12 PM
      ========================== */
      if (booking.status === "HOLD" && isAfter12PM(booking.checkIn)) {
        booking.status = "EXPIRED";

        room.holdDates = room.holdDates.filter(
          (d) => !bookingDates.includes(toDateString(d))
        );

        await room.save();
        await booking.save();
        continue;
      }

      /* =========================
         RULE 2: BOOKED → EXPIRED
         Checkout day after 12 PM
      ========================== */
      if (booking.status === "BOOKED" && isAfter12PM(booking.checkOut)) {
        room.bookedDates = room.bookedDates.filter(
          (d) => !bookingDates.includes(toDateString(d))
        );

        booking.status = "EXPIRED";

        if (booking.guest?.email) {
          await User.findOneAndUpdate(
            { email: booking.guest.email },
            { $inc: { totalBookings: 1 } }
          );
        }

        
      /* =========================
        RULE 3: CANCELLED → CANCELLED_ITEM
        Check-in day after 12 PM
      ========================== */
      if (booking.status === "CANCELLED" && isAfter12PM(booking.checkIn)) {
        booking.status = "CANCELLED_ITEM";

        room.holdDates = room.holdDates.filter(
          (d) => !bookingDates.includes(toDateString(d))
        );

        room.bookedDates = room.bookedDates.filter(
          (d) => !bookingDates.includes(toDateString(d))
        );

        await room.save();
        await booking.save();
        continue;
      }

        // Send review mail only once
        if (booking.guest?.email && !booking.reviewMailSent) {
          booking.reviewMailSent = true;
          await booking.save();

          try {
            await sendReviewMail(booking);
            console.log(`📩 Review mail sent to ${booking.guest.email}`);
          } catch (err) {
            booking.reviewMailSent = false;
            await booking.save();
            console.error("❌ Failed to send review email:", err);
          }
        }

        await room.save();
        await booking.save();
      }
    }

    console.log("✅ Expire bookings job completed");
  } catch (error) {
    console.error("❌ Expire bookings job failed:", error);
  }
};
