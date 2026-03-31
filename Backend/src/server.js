import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { connectDB } from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import roomRoutes from "./routes/room.routes.js";
import amenitiesRoutes from "./routes/amenities.routes.js";
import nearbyPlacesRoutes from "./routes/nearbyPlaces.routes.js";
import eventRoutes from "./routes/event.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

import "./jobs/index.js";

dotenv.config();

/* 🔌 Database */
connectDB();

const app = express();

/* 🌐 Allowed Origins */
const allowedOrigins = [
  "http://localhost:3000",
  "https://srk-luxe-resorts.vercel.app",
  "https://www.srkluxeresortsudumalpet.com",
  "https://srkluxeresortsudumalpet.com"
];

/* 🌐 Custom CORS Middleware (More Reliable in Production) */
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

/* 🧠 Middlewares */
app.use(express.json());
app.use(cookieParser());

/* 🚏 Routes */
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes); // ✅ removed duplicate
app.use("/api/amenities", amenitiesRoutes);
app.use("/api/nearby-places", nearbyPlacesRoutes);
app.use("/api/events", eventRoutes);
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

/* ❗ Global Error Handler (ensures CORS headers on errors) */
app.use((err, req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* 🚀 Server */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
