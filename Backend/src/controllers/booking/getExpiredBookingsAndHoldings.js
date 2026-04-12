import Booking from "../../models/Booking.js";
import { buildBookingQuery } from "./buildBookingQuery.js";

export const getExpiredBookingsAndHoldings = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const skip = (page - 1) * limit;

    const baseFilter = {
      status: "EXPIRED",
    };
    const filter = await buildBookingQuery(req, baseFilter);

    const totalCount = await Booking.countDocuments(filter);
    const paginatedExpired = await Booking.find(filter)
      .populate("roomId")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      count: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit,
      data: paginatedExpired,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch expired bookings" });
  }
};

