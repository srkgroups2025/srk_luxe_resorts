import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";

export const login = async (req, res) => {
  try {
    const { email, mobileNumber, password } = req.body;

    if ((!email && !mobileNumber) || !password) {
      return res.status(400).json({
        message: "Email or mobile number and password are required",
      });
    }

    const user = await User.findOne({
      $or: [{ email }, { mobileNumber }],
    }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🔒 Block if email not verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    /* ✅ SET COOKIE */
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: false,        // 🔴 false for localhost
      sameSite: "lax",      // 🔴 REQUIRED for localhost
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
