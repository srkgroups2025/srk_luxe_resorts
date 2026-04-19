import bcrypt from "bcryptjs";
import crypto from "crypto";
import Joi from "joi";
import User from "../../models/User.js";

const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10");

// ✅ Input validation schema
const resetPasswordSchema = Joi.object({
  newPassword: Joi.string()
    .min(8)
    .pattern(/[A-Z]/)
    .pattern(/[a-z]/)
    .pattern(/[0-9]/)
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.pattern.base":
        "Password must contain uppercase, lowercase, and numbers",
    }),
  confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required().messages({
    "any.only": "Passwords do not match",
  }),
});

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    // ✅ Validate input
    const { error, value } = resetPasswordSchema.validate(
      { newPassword, confirmPassword },
      { abortEarly: false, stripUnknown: true }
    );

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        message: "Validation error",
        errors: messages,
      });
    }

    // ✅ Validate token format
    if (!token || typeof token !== "string" || token.length < 20) {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(String(token).trim())
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // ✅ Hash new password with configured salt rounds
    user.password = await bcrypt.hash(value.newPassword, BCRYPT_SALT_ROUNDS);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password reset successful. Please login again." });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "An error occurred during password reset" });
  }
};
