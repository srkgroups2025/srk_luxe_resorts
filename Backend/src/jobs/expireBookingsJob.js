import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import User from "../models/User.js";
import { getDatesBetween } from "../controllers/booking/getDatesBetween.js";

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

/* ---------------- CRON JOB ---------------- */

export const expireBookingsJob = async () => {
  try {
    const bookings = await Booking.find({
      status: { $in: ["BOOKED", "HOLD"] },
    });

    for (const booking of bookings) {
      const room = await Room.findById(booking.roomId);
      if (!room) continue;

      /* =========================
         CLEANUP RULE (IMPORTANT)
         Remove yesterday & past dates
      ========================== */
      room.holdDates = room.holdDates.filter(
        (d) => !isPastDate(toDateString(d))
      );

      room.bookedDates = room.bookedDates.filter(
        (d) => !isPastDate(toDateString(d))
      );

      /* =========================
         GET BOOKING DATE RANGE
      ========================== */
      const bookingDates = getDatesBetween(
        booking.checkIn,
        booking.checkOut
      ).map(toDateString);

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

        // Increment completed bookings
        if (booking.guest?.email) {
          await User.findOneAndUpdate(
            { email: booking.guest.email },
            { $inc: { totalBookings: 1 } }
          );
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
