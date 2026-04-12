import Room from "../../models/Room.js";
import Booking from "../../models/Booking.js";
import { getDatesBetween } from "./getDatesBetween.js";
import { generateHoldingId } from "../../jobs/generateId.js";
import mongoose from "mongoose";

export const holdDates = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      roomId,
      checkIn,
      checkOut,
      bookingDates = [],
      guests,
      guest,
      name,
      mobile,
    } = req.body;

    const room = await Room.findById(roomId).session(session);
    if (!room) throw new Error("Room not found");

    const selectedDates = Array.isArray(bookingDates) && bookingDates.length > 0
      ? bookingDates
      : getDatesBetween(checkIn, checkOut);

    const guestName = guest?.name || name || "";
    const guestMobile = guest?.mobile || mobile || "";

    if (!guestName.trim() || !guestMobile.trim()) {
      throw new Error("Customer name and mobile number are required");
    }

    const unavailableDates = new Set([
      ...room.bookedDates,
      ...room.holdDates,
    ]);

    if (selectedDates.some(d => unavailableDates.has(d))) {
      throw new Error("Dates already blocked");
    }

    // ✅ BLOCK DATES
    room.holdDates.push(...selectedDates);
    await room.save({ session });

    // ✅ FIX: await the ID
    const holdingId = await generateHoldingId();

    const booking = await Booking.create(
      [{
        bookingId: holdingId, // ✅ STRING now
        roomId,
        guest: {
          name: guestName.trim(),
          mobile: guestMobile.trim(),
        },
        guests,
        checkIn,
        checkOut,
        nights: selectedDates.length,
        status: "HOLD",
      }],
      { session }
    );

    await session.commitTransaction();

    res.status(200).json({
      message: "Dates held successfully",
      booking: booking[0],
    });

  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({
      message: error.message || "Hold failed",
    });
  } finally {
    session.endSession();
  }
};


