import mongoose from "mongoose";

const amenitiesSchema = new mongoose.Schema({
  name: { type: String, required: true },
  images: { type: [String], default: [] }, // Array of image URLs
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("Amenities", amenitiesSchema);
