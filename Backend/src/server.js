import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { connectDB } from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import roomRoutes from "./routes/room.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

import "./jobs/index.js";

dotenv.config();

/* 🔌 Database */
connectDB();

const app = express();

/* 🌐 CORS configuration */
const allowedOrigins = [
  "http://localhost:3000",
  "https://srk-luxe-resorts.vercel.app",
  "https://www.srkluxeresortsudumalpet.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* 🧠 Middlewares */
app.use(express.json());
app.use(cookieParser());

/* 🚏 Routes */
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payment", paymentRoutes);

/* ❤️ Health check (optional but recommended) */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SRK Luxe Resorts API is running...",
  });
});

/* 🚀 Server */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
