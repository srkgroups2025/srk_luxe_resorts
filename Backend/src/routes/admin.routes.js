import express from "express";
import { getAnalytics } from "../controllers/admin.controller.js";

const router = express.Router();

// GET analytics for dashboard
router.get("/analytics", getAnalytics);

export default router;
