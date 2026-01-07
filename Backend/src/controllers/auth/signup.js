import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../../models/User.js";
import { signUpEmailSendor } from "./sendEmail.js";

export const signup = async (req, res) => {
  try {
    const {
      name,
      email,
      mobileNumber,
      password,
      isMobileNumberVerified = false,
    } = req.body;

    /* ---------------- VALIDATION ---------------- */
    if (!name || !email || !mobileNumber || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    /* ---------------- EMAIL CHECK ---------------- */
    const existingEmailUser = await User.findOne({ email });

    if (existingEmailUser) {
      if (existingEmailUser.isEmailVerified) {
        return res.status(409).json({
          message: "User already exists with this email",
        });
      }

      // resend verification email
      const verifyToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(verifyToken)
        .digest("hex");

      existingEmailUser.emailVerificationToken = hashedToken;
      existingEmailUser.emailVerificationExpire =
        Date.now() + 24 * 60 * 60 * 1000;

      await existingEmailUser.save();

      const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${verifyToken}`;
      await signUpEmailSendor(existingEmailUser.email, verificationLink);

      return res.status(200).json({
        message:
          "Email already exists but not verified. Verification email resent.",
      });
    }

    /* ---------------- MOBILE CHECK ---------------- */
    const existingMobileUser = await User.findOne({ mobileNumber });

    if (existingMobileUser) {
      return res.status(409).json({
        message: "User already exists with this mobile number",
      });
    }

    /* ---------------- HASH PASSWORD ---------------- */
    const hashedPassword = await bcrypt.hash(password, 10);

    /* ---------------- EMAIL TOKEN ---------------- */
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const hashedVerifyToken = crypto
      .createHash("sha256")
      .update(verifyToken)
      .digest("hex");

    /* ---------------- CREATE USER ---------------- */
    const user = await User.create({
      name,
      email,
      mobileNumber,
      password: hashedPassword,
      isMobileNumberVerified,
      totalBookings: 0,
      emailVerificationToken: hashedVerifyToken,
      emailVerificationExpire:
        Date.now() + 24 * 60 * 60 * 1000,
    });

    /* ---------------- SEND EMAIL ---------------- */
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${verifyToken}`;
    await signUpEmailSendor(user.email, verificationLink);

    /* ---------------- SAFE RESPONSE ---------------- */
    res.status(201).json({
      message: "Signup successful. Please verify your email.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        totalBookings: user.totalBookings,
        isEmailVerified: user.isEmailVerified,
        isMobileVerified: user.isMobileNumberVerified,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({
      message: "Server error during signup",
    });
  }
};
