import express from "express";
import { adminOnly, customerOnly } from "../middlewares/authMiddleware.js";
import { protect } from "../middlewares/authMiddleware.js";
import { createBooking } from "../controllers/booking/createBooking.js";
import { holdDates } from "../controllers/booking/holdDates.js";
import { getUserBookings } from "../controllers/booking/getUserBookings.js";
import { requestCancelBooking } from "../controllers/booking/requestCancelBooking.js";
import { cancelHold } from "../controllers/booking/cancelHold.js";
import { getAllBookingsAndHoldings } from "../controllers/booking/getAllBookingsAndHoldings.js";
import { getExpiredBookingsAndHoldings } from "../controllers/booking/getExpiredBookingsAndHoldings.js";
import { approveCancelBooking } from "../controllers/booking/approveCancelBooking.js";
import { rejectCancelBooking } from "../controllers/booking/rejectCancelBooking.js";

const router = express.Router();

/* ---------------- CUSTOMER ---------------- */

router.post("/book", protect, customerOnly, createBooking);
router.get("/user", protect, customerOnly, getUserBookings);
router.patch("/book/:bookingId/cancel", protect, customerOnly, requestCancelBooking);

/* ---------------- ADMIN ---------------- */

router.post("/hold", protect, adminOnly, holdDates);
router.delete("/hold/:bookingId/cancel", protect, adminOnly, cancelHold);
router.get("/all", protect, adminOnly, getAllBookingsAndHoldings);
router.get("/expired", protect, adminOnly, getExpiredBookingsAndHoldings);

router.patch("/book/:bookingId/approve-cancel", protect, adminOnly, approveCancelBooking);
router.patch( "/book/:bookingId/reject-cancel", protect, adminOnly, rejectCancelBooking);

export default router;
