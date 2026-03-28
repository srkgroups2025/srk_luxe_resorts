import mongoose from "mongoose";

const nearbyPlacesSchema = new mongoose.Schema({
  name: { type: String, required: true },
  images: { type: [String], default: [] }, // Array of image URLs
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("NearbyPlaces", nearbyPlacesSchema);
