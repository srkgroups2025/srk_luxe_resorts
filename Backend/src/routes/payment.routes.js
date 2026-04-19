import express from "express";
import { createPaymentOrder } from "../controllers/payment/createOrder.js";
import { protect, customerOnly } from "../middlewares/authMiddleware.js";
import { verifyPayment } from "../controllers/payment/verifyPayment.js";
import webhookRouter from "../controllers/payment/webhook.js";

const router = express.Router();

router.post("/create-order", protect, customerOnly, createPaymentOrder);
router.post("/verify", protect, customerOnly, verifyPayment);

router.use("/", webhookRouter);

export default router;
