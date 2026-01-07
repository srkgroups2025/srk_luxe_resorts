import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpire: Date,

    resetPasswordToken: String,
    resetPasswordExpire: Date,

    mobileNumber: {
      type: String,
      required: true,
      unique: true,
      sparse: true, // ✅ prevents null conflicts
    },
    mobileOtp: String,
    mobileOtpExpire: Date,
    isMobileNumberVerified: {
      type: Boolean,
      default: false,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: ["admin", "customer"],
      default: "customer",
    },

    totalBookings: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
