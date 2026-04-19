import crypto from "crypto";
import Joi from "joi";
import User from "../../models/User.js";
import { resetPasswordEmailSender } from "./sendEmail.js";

// ✅ Input validation schema
const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      "string.email": "Please provide a valid email address",
      "string.empty": "Email is required",
    }),
});

export const forgotPassword = async (req, res) => {
  try {
    // ✅ Validate input
    const { error, value } = forgotPasswordSchema.validate(req.body, {
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

    const { email } = value;
    const user = await User.findOne({ email });

    if (!user) {
      // ✅ Don't reveal if email exists (security best practice)
      return res.status(200).json({
        message: "If email exists, password reset link will be sent",
      });
    }

    // Generate raw token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before saving
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

    await user.save({ validateBeforeSave: false });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await resetPasswordEmailSender(user.email, resetLink);

    // ✅ Don't reveal if email was actually sent (security best practice)
    res.json({
      message: "Password reset link will be sent through email ",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "An error occurred" });
  }
};
