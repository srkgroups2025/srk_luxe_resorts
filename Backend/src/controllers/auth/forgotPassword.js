import crypto from "crypto";
import User from "../../models/User.js";
import { resetPasswordEmailSender } from "./sendEmail.js";

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
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

    res.json({
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
