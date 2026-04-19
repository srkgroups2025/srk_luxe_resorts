import bcrypt from "bcryptjs";
import crypto from "crypto";
import Joi from "joi";
import User from "../../models/User.js";
import { signUpEmailSendor } from "./sendEmail.js";

const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10");

// ✅ Input Validation Schema
const signupSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      "string.empty": "Name is required",
      "string.min": "Name must be at least 2 characters",
      "string.max": "Name cannot exceed 50 characters",
    }),
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      "string.email": "Please provide a valid email address",
      "string.empty": "Email is required",
    }),
  mobileNumber: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Mobile number must be 10 digits",
      "string.empty": "Mobile number is required",
    }),
  password: Joi.string()
    .min(8)
    .pattern(/[A-Z]/)
    .pattern(/[a-z]/)
    .pattern(/[0-9]/)
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.pattern.base":
        "Password must contain uppercase, lowercase, and numbers",
      "string.empty": "Password is required",
    }),
  isMobileNumberVerified: Joi.boolean().default(false),
});

export const signup = async (req, res) => {
  try {
    // ✅ Validate input with Joi
    const { error, value } = signupSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        message: "Validation error",
        errors: messages,
      });
    }

    const { name, email, mobileNumber, password, isMobileNumberVerified } = value;

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

    /* ✅ HASH PASSWORD WITH CONFIGURED SALT ROUNDS */
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    /* ✅ EMAIL TOKEN */
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const hashedVerifyToken = crypto
      .createHash("sha256")
      .update(verifyToken)
      .digest("hex");

    /* ✅ CREATE USER */
    const user = await User.create({
      name,
      email,
      mobileNumber,
      password: hashedPassword,
      isMobileNumberVerified,
      totalBookings: 0,
      emailVerificationToken: hashedVerifyToken,
      emailVerificationExpire: Date.now() + 24 * 60 * 60 * 1000,
    });

    /* ✅ SEND EMAIL */
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${verifyToken}`;
    await signUpEmailSendor(user.email, verificationLink);

    /* ✅ SAFE RESPONSE - DO NOT SEND SENSITIVE DATA */
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
      message: "An error occurred during signup",
    });
  }
};
