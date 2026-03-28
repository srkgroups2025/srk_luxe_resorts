import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { adminOnly } from "../middlewares/authMiddleware.js";
import { createEvent } from "../controllers/event/createEvent.js";
import { getAllEvent } from "../controllers/event/getAllEvent.js";
import { updateEvent } from "../controllers/event/updateEvent.js";
import { deleteEvent } from "../controllers/event/deleteEvent.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

// Public route to get all events
router.get("/", getAllEvent);

// Admin routes
router.post("/create", protect, adminOnly,upload.array("images", 10), createEvent);
router.put("/update/:id", protect, adminOnly, upload.array("images", 10), updateEvent);
router.delete("/delete/:id", protect, adminOnly, deleteEvent);

export default router;
