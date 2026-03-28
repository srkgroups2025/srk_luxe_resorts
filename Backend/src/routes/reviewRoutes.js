import express from "express";
import { createReview, getReview } from "../controllers/review/reviews.js";

const router = express.Router();

router.post("/create", createReview);
router.get("/", getReview);

export default router;
