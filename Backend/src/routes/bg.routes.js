import express from "express";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import { createBG } from "../controllers/bg/createBG.js";
import { getAllBG } from "../controllers/bg/getAllBG.js";
import { deleteBG } from "../controllers/bg/deleteBG.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

// Public route to get all BG images
router.get("/", getAllBG);

// Admin routes
router.post(
  "/create",
  protect,
  adminOnly,
  upload.array("images", 10),
  createBG
);

router.delete("/delete/:id", protect, adminOnly, deleteBG);

export default router;
