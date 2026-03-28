import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { adminOnly } from "../middlewares/authMiddleware.js";
import { createAmenities } from "../controllers/amenities/createAmenities.js";
import { getAllAmenities } from "../controllers/amenities/getAllAmenities.js";
import { updateAmenities } from "../controllers/amenities/updateAmenities.js";
import { deleteAmenities } from "../controllers/amenities/deleteAmenities.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

// Public route to get all amenities
router.get("/", getAllAmenities);

// Admin routes
router.post("/create", protect, adminOnly,upload.array("images", 10), createAmenities);
router.put("/update/:id", protect, adminOnly, upload.array("images", 10), updateAmenities);
router.delete("/delete/:id", protect, adminOnly, deleteAmenities);

export default router;
