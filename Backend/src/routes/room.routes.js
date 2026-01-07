import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { adminOnly } from "../middlewares/authMiddleware.js";
import { createRoom } from "../controllers/room/createRoom.js";
import { getAllRoom } from "../controllers/room/getAllRoom.js";
import { updateRoom } from "../controllers/room/updateRoom.js";
import { deleteRoom } from "../controllers/room/deleteRoom.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

// Public route to get all rooms
router.get("/", getAllRoom);

// Admin routes
router.post("/create", protect, adminOnly,upload.array("images", 10), createRoom);
router.put("/update/:id", protect, adminOnly, upload.array("images", 10), updateRoom);
router.delete("/delete/:id", protect, adminOnly, deleteRoom);

export default router;
