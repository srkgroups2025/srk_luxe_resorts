import express from "express";
import { getAnalytics } from "../controllers/admin.controller.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET analytics for dashboard - PROTECTED ROUTE
router.get("/analytics", protect, adminOnly, getAnalytics);

export default router;
