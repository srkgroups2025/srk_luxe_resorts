import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  gst: { type: Number, required: true }, // GST in percentage
  maxGuest: { type: Number, required: true },
  amenities: { type: [String], default: [] }, // e.g., ["WiFi", "AC", "TV"]
  description: { type: String, required: true },
  bookedDates: { type: [Date], default: [] }, // Dates when the room is booked
  holdDates: {
    type: [String], // admin holds
    default: [],
  },
  images: { type: [String], default: [] }, // Array of image URLs
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("Room", roomSchema);
