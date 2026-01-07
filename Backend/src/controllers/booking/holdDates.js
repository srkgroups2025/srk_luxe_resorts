import Room from "../../models/Room.js";
import Booking from "../../models/Booking.js";
import { getDatesBetween } from "./getDatesBetween.js";
import { generateHoldingId } from "../../jobs/generateId.js";
import mongoose from "mongoose";

export const holdDates = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { roomId, checkIn, checkOut, guests } = req.body;

    const room = await Room.findById(roomId).session(session);
    if (!room) throw new Error("Room not found");

    const selectedDates = getDatesBetween(checkIn, checkOut);

    const unavailableDates = new Set([
      ...room.bookedDates,
      ...room.holdDates,
    ]);

    if (selectedDates.some(d => unavailableDates.has(d))) {
      throw new Error("Dates already blocked");
    }

    room.holdDates.push(...selectedDates);
    await room.save({ session });

    const booking = await Booking.create([{
      bookingId: generateHoldingId(),
      roomId,
      guests,
      checkIn,
      checkOut,
      status: "HOLD",
    }], { session });

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

