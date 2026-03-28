import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, required: true }, // email identifies review
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String,
    approved: { type: Boolean, default: true }, // show immediately
  },
  { timestamps: true }
);

export default mongoose.model("Review", reviewSchema);
