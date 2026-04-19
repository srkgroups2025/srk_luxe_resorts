import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import { getDatesBetween } from "../controllers/booking/getDatesBetween.js";
import { sendBookingConfirmationEmail } from "../controllers/auth/sendEmail.js";

const normalize = d => new Date(d).toISOString().split("T")[0];

export const confirmBookingService = async (bookingId, guest = null) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findOne({ bookingId }).session(session);

    if (!booking) throw new Error("Booking not found");

    // ✅ IMPORTANT: prevent duplicate execution
    if (booking.status === "BOOKED") {
      await session.commitTransaction();
      return booking;
    }

    booking.status = "BOOKED";
    booking.paymentStatus = "SUCCESS";

    if (guest) {
      booking.guest = guest;
    }

    await booking.save({ session });

    const room = await Room.findById(booking.roomId).session(session);

    const dates = getDatesBetween(booking.checkIn, booking.checkOut);

    room.bookedDates.push(...dates);

    room.holdDates = room.holdDates.filter(
      d => !dates.map(normalize).includes(normalize(d))
    );

    await room.save({ session });

    await session.commitTransaction();

    await sendBookingConfirmationEmail(booking);

    return booking;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};