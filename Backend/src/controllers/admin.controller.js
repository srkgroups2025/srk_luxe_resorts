import Booking from "../models/Booking.js";
import User from "../models/User.js";

// Month labels
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// GET /api/admin/analytics
export const getAnalytics = async (req, res) => {
  try {
    const { view = "monthly", month, year } = req.query;

    const selectedMonth =
      month !== undefined ? parseInt(month) : new Date().getMonth();

    const selectedYear =
      year ? parseInt(year) : new Date().getFullYear();

    let data = [];

    /* =========================
       MONTHLY VIEW (WEEKLY)
    ========================== */
    if (view === "monthly") {
      const start = new Date(selectedYear, selectedMonth, 1);
      const end = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);

      const bookings = await Booking.find({
        checkIn: { $gte: start, $lte: end },
        status: "EXPIRED",
      });

      const weeks = [1, 2, 3, 4, 5];

      data = weeks.map((week) => {
        const weekStart = (week - 1) * 7 + 1;
        const weekEnd = week === 5 ? 31 : week * 7;

        const weekBookings = bookings.filter((b) => {
          const day = b.checkIn.getDate();
          return day >= weekStart && day <= weekEnd;
        });

        return {
          name: `Week ${week}`,
          bookings: weekBookings.length,
          amount: weekBookings.reduce(
            (sum, b) => sum + (b.totalAmount || 0),
            0
          ),
        };
      });
    }

    /* =========================
       YEARLY VIEW (MONTHLY)
    ========================== */
    if (view === "yearly") {
      const start = new Date(selectedYear, 0, 1);
      const end = new Date(selectedYear, 11, 31, 23, 59, 59);

      const bookings = await Booking.find({
        checkIn: { $gte: start, $lte: end },
        status: "EXPIRED",
      });

      data = months.map((monthName, index) => {
        const monthBookings = bookings.filter(
          (b) => b.checkIn.getMonth() === index
        );

        return {
          name: monthName,
          bookings: monthBookings.length,
          amount: monthBookings.reduce(
            (sum, b) => sum + (b.totalAmount || 0),
            0
          ),
        };
      });
    }

    /* =========================
       OVERALL VIEW (YEARLY)
    ========================== */
    if (view === "overall") {
      const bookings = await Booking.find({ status: "EXPIRED" });

      const years = [
        ...new Set(bookings.map((b) => b.checkIn.getFullYear())),
      ].sort();

      data = years.map((y) => {
        const yearBookings = bookings.filter(
          (b) => b.checkIn.getFullYear() === y
        );

        return {
          name: `${y}`,
          bookings: yearBookings.length,
          amount: yearBookings.reduce(
            (sum, b) => sum + (b.totalAmount || 0),
            0
          ),
        };
      });
    }

    /* =========================
       TOTALS (CURRENT VIEW)
    ========================== */
    const totalBookings = data.reduce(
      (sum, item) => sum + item.bookings,
      0
    );

    const totalAmount = data.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    /* =========================
       GLOBAL COUNTS (ALL TIME)
    ========================== */
    const totalBookingsCount = await Booking.countDocuments({
      status: "EXPIRED",
    });

    const totalCustomersCount = await User.countDocuments({
      role: "customer",
      // isActive: true, // uncomment if needed
    });

    /* =========================
       RESPONSE
    ========================== */
    res.json({
      data,
      totalBookings,
      totalAmount,

      // ✅ CORRECT COUNTS
      totalBookingsCount,
      totalCustomersCount,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
