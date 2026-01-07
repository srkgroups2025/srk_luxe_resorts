import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      index: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    guest: {
      name: {
        type: String,
        required: function () {
          return this.status === "BOOKED";
        },
      },
      email: {
        type: String,
        required: function () {
          return this.status === "BOOKED";
        },
      },
      mobile: {
        type: String,
        required: function () {
          return this.status === "BOOKED";
        },
      },
    },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    guests: {
      adults: { type: Number, default: 0 },
      children: { type: Number, default: 0 },
    },
    hasCheckedIn: { type: Boolean, default: false },
    reviewMailSent: { type: Boolean, default: false },
    nights: Number,
    pricePerNight: Number,
    gst: Number,
    totalAmount: Number,
    cancelReason: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["BOOKED", "HOLD", "CANCEL_REQUESTED", "CANCELLED", "EXPIRED"],
      default: "BOOKED",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
