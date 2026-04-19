import express from "express";
import { signup } from "../controllers/auth/signup.js";
import { verifyEmail } from "../controllers/auth/verifyEmail.js";
import { login } from "../controllers/auth/login.js";
import { forgotPassword } from "../controllers/auth/forgotPassword.js";
import { resetPassword } from "../controllers/auth/resetPassword.js";
import logout from "../controllers/auth/logout.js";
import { protect } from "../middlewares/authMiddleware.js";
import { getProfile } from "../controllers/user/getProfile.js";
import { loginLimiter, forgotPasswordLimiter, signupLimiter } from "../middlewares/rateLimiters.js";

const router = express.Router();

router.post("/signup", signupLimiter, signup);
router.get("/verify-email/:token", verifyEmail);
router.post("/login", loginLimiter, login);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.post("/logout", protect, logout);

router.get("/me", protect, getProfile);

export default router;
