import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";

const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10");
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || "5h";

export const login = async (req, res) => {
  try {
    const { email, mobileNumber, password } = req.body;

    // Input validation
    if ((!email && !mobileNumber) || !password) {
      return res.status(400).json({
        message: "Email or mobile number and password are required",
      });
    }

    // Prevent NoSQL injection by using proper field names
    const user = await User.findOne({
      $or: [{ email: String(email || "").trim() }, { mobileNumber: String(mobileNumber || "").trim() }],
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

    // ✅ Generate JWT with SHORT expiration
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    // ✅ Set httpOnly, secure cookie (never expose role or ID in cookies)
    res.cookie("accessToken", token, {
      httpOnly: true, // 🔐 Prevents JS access (XSS protection)
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "lax", // Allow credentials with cross-origin requests
      maxAge: 5 * 60 * 60 * 1000, // 5 hours
      path: "/",
    });

    // Return user data (NOT token or role in response body)
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
    res.status(500).json({ message: "An error occurred during login" });
  }
};
