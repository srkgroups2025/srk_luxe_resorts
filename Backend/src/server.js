import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import hpp from "hpp";

import { connectDB } from "./config/db.js";
import { loginLimiter, forgotPasswordLimiter, signupLimiter, generalLimiter } from "./middlewares/rateLimiters.js";

import authRoutes from "./routes/auth.routes.js";
import roomRoutes from "./routes/room.routes.js";
import amenitiesRoutes from "./routes/amenities.routes.js";
import nearbyPlacesRoutes from "./routes/nearbyPlaces.routes.js";
import eventRoutes from "./routes/event.routes.js";
import BGRoutes from "./routes/bg.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

import "./jobs/index.js";

/* 🔌 Database */
connectDB();

const app = express();

/* 🔒 Security Middleware */
app.use(helmet()); // Set security headers
app.use(hpp()); // Prevent parameter pollution

/* 🌐 Allowed Origins */
const allowedOrigins = [
  "http://localhost:3000",
  "https://srk-luxe-resorts.vercel.app",
  "https://www.srkluxeresortsudumalpet.com",
  "https://srkluxeresortsudumalpet.com"
];

/* 🌐 CORS Configuration */
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Cookie"
    );
  }

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

/* 🧠 Body Parsing Middleware */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

/* � Routes */
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes); // ✅ removed duplicate
app.use("/api/amenities", amenitiesRoutes);
app.use("/api/nearby-places", nearbyPlacesRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bg", BGRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/reviews", reviewRoutes);

/* ❤️ Health check */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SRK Luxe Resorts API is running...",
  });
});

/* ❗ Global Error Handler */
app.use((err, req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  // Log full error server-side (never send to client)
  console.error("ERROR:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Send generic error to client
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "An error occurred. Please try again later."
        : err.message || "Internal Server Error",
  });
});

/* 404 Handler */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* 🚀 Server */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export { loginLimiter, forgotPasswordLimiter, signupLimiter, generalLimiter };
