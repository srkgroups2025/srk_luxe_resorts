import Booking from "../../models/Booking.js";
import { buildBookingQuery } from "./buildBookingQuery.js";

export const getAllBookingsAndHoldings = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const skip = (page - 1) * limit;

    const baseFilter = {
      status: { $in: ["BOOKED", "HOLD", "CANCEL_REQUESTED", "CANCELLED"] },
    };
    const filter = await buildBookingQuery(req, baseFilter);

    const totalCount = await Booking.countDocuments(filter);
    const paginatedBookings = await Booking.find(filter)
      .populate("roomId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      count: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit,
      data: paginatedBookings,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

