import mongoose from "mongoose";
import Room from "../../models/Room.js";
import Booking from "../../models/Booking.js";
import { getDatesBetween } from "./getDatesBetween.js";
import { generateBookingId } from "../../jobs/generateId.js";
import { sendBookingConfirmationEmail } from "../auth/sendEmail.js";
import { confirmBookingService } from "../../services/booking.service.js";

/**
 * Normalize date for safe comparison
 */
const normalize = d => new Date(d).toISOString().split("T")[0];

/**
 * CREATE PENDING BOOKING
 */
export const createPendingBooking = async (req, res) => {
  try {
    const {
      roomId,
      checkIn,
      checkOut,
      bookingDates,
      guests,
      nights,
      pricePerNight,
      gst,
      totalAmount,
    } = req.body;

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const unavailableSet = new Set(
      [...room.bookedDates, ...room.holdDates].map(normalize)
    );

    const conflict = bookingDates.some(d =>
      unavailableSet.has(normalize(d))
    );

    if (conflict) {
      return res.status(400).json({ message: "Dates not available" });
    }

    const bookingId = await generateBookingId();

    const booking = await Booking.create({
      bookingId,
      roomId,
      checkIn,
      checkOut,
      guests,
      nights,
      pricePerNight,
      gst,
      totalAmount,
      status: "PENDING_PAYMENT",
      paymentStatus: "PENDING",
    });

    room.holdDates.push(...bookingDates);
    await room.save();

    res.status(201).json({ bookingId: booking.bookingId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create pending booking" });
  }
};

/**
 * CONFIRM BOOKING (TRANSACTION SAFE)
 */
export const confirmBooking = async (req, res) => {
  try {
    const { bookingId, guest } = req.body;

    await confirmBookingService(bookingId, guest);

    res.json({ message: "Booking confirmed" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * MANUAL CANCEL PENDING BOOKING
 */
export const cancelPendingBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findOne({ bookingId });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const room = await Room.findById(booking.roomId);
    const dates = getDatesBetween(booking.checkIn, booking.checkOut);

    room.holdDates = room.holdDates.filter(
      d => !dates.map(normalize).includes(normalize(d))
    );

    await room.save();
    await booking.deleteOne();

    res.json({ message: "Pending booking removed" });
  } catch (err) {
    res.status(500).json({ message: "Failed to cancel booking" });
  }
};
