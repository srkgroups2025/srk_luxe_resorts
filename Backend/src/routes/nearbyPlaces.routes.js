import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { adminOnly } from "../middlewares/authMiddleware.js";
import { createNearbyPlaces } from "../controllers/nearbyPlaces/createNearbyPlaces.js";
import { getAllNearbyPlaces } from "../controllers/nearbyPlaces/getAllNearbyPlaces.js";
import { updateNearbyPlaces } from "../controllers/nearbyPlaces/updateNearbyPlaces.js";
import { deleteNearbyPlaces } from "../controllers/nearbyPlaces/deleteNearbyPlaces.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

// Public route to get all nearbyPlaces
router.get("/", getAllNearbyPlaces);

// Admin routes
router.post("/create", protect, adminOnly,upload.array("images", 10), createNearbyPlaces);
router.put("/update/:id", protect, adminOnly, upload.array("images", 10), updateNearbyPlaces);
router.delete("/delete/:id", protect, adminOnly, deleteNearbyPlaces);

export default router;
