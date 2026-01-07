import express from "express";
import { sendMobileOtp, verifyMobileOtp } from "../controllers/auth/mobile-otp.js";
import { signup } from "../controllers/auth/signup.js";
import { verifyEmail } from "../controllers/auth/verifyEmail.js";
import { login } from "../controllers/auth/login.js";
import { forgotPassword } from "../controllers/auth/forgotPassword.js";
import { resetPassword } from "../controllers/auth/resetPassword.js";
import logout from "../controllers/auth/logout.js";
import { protect } from "../middlewares/authMiddleware.js";
import { getProfile } from "../controllers/user/getProfile.js";

const router = express.Router();

router.post("/send-mobile-otp", sendMobileOtp);
router.post("/verify-mobile-otp", verifyMobileOtp);
router.post("/signup", signup);
router.get("/verify-email/:token", verifyEmail);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.post("/logout", logout);

router.get("/me", protect, getProfile);

export default router;
