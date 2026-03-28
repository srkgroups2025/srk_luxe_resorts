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

    nights: Number,
    pricePerNight: Number,
    gst: Number,
    totalAmount: Number,

    hasCheckedIn: { type: Boolean, default: false },
    reviewMailSent: { type: Boolean, default: false },

    cancelReason: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "PENDING_PAYMENT",
        "BOOKED",
        "HOLD",
        "CANCEL_REQUESTED",
        "CANCELLED",
        "CANCELLED_ITEM",
        "EXPIRED",
      ],
      default: "PENDING_PAYMENT",
      index: true,
    },
  },
  { timestamps: true }
);

/**
 * TTL INDEX
 * Deletes ONLY pending bookings after 5 minutes
 */
bookingSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 300, // 5 minutes
    partialFilterExpression: { status: "PENDING_PAYMENT" },
  }
);

export default mongoose.model("Booking", bookingSchema);
