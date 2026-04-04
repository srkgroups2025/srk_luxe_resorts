import mongoose from "mongoose";

const bgSchema = new mongoose.Schema(
  {
    images: {
      type: [String],
      required: true,
      validate: {
        validator: function (value) {
          return value.length > 0; // at least one image required
        },
        message: "Please upload at least one image"
      }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("BG", bgSchema);