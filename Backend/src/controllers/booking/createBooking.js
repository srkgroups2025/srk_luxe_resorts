import Room from "../../models/Room.js";
import Booking from "../../models/Booking.js";
import { getDatesBetween } from "./getDatesBetween.js";
import { generateBookingId } from "../../jobs/generateId.js";
import { sendBookingConfirmationEmail } from "../auth/sendEmail.js";

export const createBooking = async (req, res) => {
  try {
    const {
      roomId,
      checkIn,
      checkOut,
      guest,
      guests,
      nights,
      pricePerNight,
      gst,
      totalAmount,
    } = req.body;

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const selectedDates = getDatesBetween(checkIn, checkOut);

    const unavailableDates = [
      ...room.bookedDates,
      ...room.holdDates,
    ];

    const isUnavailable = selectedDates.some(date =>
      unavailableDates.includes(date)
    );

    if (isUnavailable) {
      return res.status(400).json({ message: "Selected dates not available" });
    }

    const booking = await Booking.create({
      bookingId: generateBookingId(),
      roomId,
      guest,
      checkIn,
      checkOut,
      guests,
      nights,
      pricePerNight,
      gst,
      totalAmount,
      status: "BOOKED",
    });

    // Update room dates
    room.bookedDates.push(...selectedDates);

    // Remove holds if present
    room.holdDates = room.holdDates.filter(
      date => !selectedDates.includes(date)
    );

    await room.save();

    // Populate room details for email
    await booking.populate("roomId");
    await sendBookingConfirmationEmail(booking);

    res.status(201).json({
      message: "Booking confirmed",
      booking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Booking failed" });
  }
};
