"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { getDatesBetween } from "../../../utils/getDatesBetween";
import { useAdminBookings } from "../../../hooks/useBook";

// Skeleton Loader for Table Rows
const TableRowSkeleton = () => (
  <motion.tr
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{ duration: 2, repeat: Infinity }}
    className="border-b"
  >
    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
      <td key={i} className="p-4">
        <div className="h-4 bg-gray-200 rounded w-full" />
      </td>
    ))}
  </motion.tr>
);

const statusStyle = {
  booked: "bg-green-100 text-green-700",
  confirmed: "bg-green-100 text-green-700",
  hold: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
  cancel_requested: "bg-yellow-100 text-yellow-700",
  expired: "bg-gray-200 text-gray-700",
};

const isCancelDisabled = (checkIn) => {
  const now = new Date();
  const checkInDate = new Date(checkIn);

  // set check-in expiry time to today 12 PM
  checkInDate.setHours(12, 0, 0, 0);

  return now >= checkInDate;
};

export default function BookingsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const {
    getAllBookingsAndHoldings,
    getAllExpiredBookingsAndHoldings,
    cancelAdminHoldings,
    approveCancelBookings,
    rejectCancelBookings,
  } = useAdminBookings({
    enabledUpcoming: !showHistory,
    enabledHistory: showHistory,
  });

  // ✅ DATA SOURCES (Backend driven)
  const upcomingBookings =
    getAllBookingsAndHoldings.data?.data || [];

  const historyBookings =
    getAllExpiredBookingsAndHoldings.data?.data || [];

  // 🔍 Search filter
  const filteredData = useMemo(() => {
    const source = showHistory ? historyBookings : upcomingBookings;
    const searchLower = search.toLowerCase();

    return source.filter((b) => {
      return (
        b.bookingId?.toLowerCase().includes(searchLower) ||
        b.mobile?.includes(search) ||
        b.guest?.toLowerCase().includes(searchLower) ||
        b.roomId?.name?.toLowerCase().includes(searchLower)
      );
    });
  }, [search, showHistory, upcomingBookings, historyBookings]);

  // 📅 Format date (DD/MM/YYYY)
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()}`;
  };

  // 🌙 Nights calculation
  const calculateNights = (checkIn, checkOut) => {
    const dates = getDatesBetween(checkIn, checkOut);
    return dates.length;
  };

  return (
    <div className="min-h-screen pt-10 px-6 bg-bgColor">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6"
      >
        <h1 className="text-3xl font-bold text-primaryLite">
          {showHistory ? "Booking History" : "Upcoming Bookings"}
        </h1>

        <div className="flex gap-3 w-full sm:w-auto">
          <motion.input
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            type="text"
            placeholder="Search by Booking ID, Mobile, Guest, Room"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border rounded-full w-full sm:w-80 focus:ring-2 focus:ring-primaryLite"
          />

          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowHistory(false)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${!showHistory ? "bg-primaryLite text-white" : "border"}`}
          >
            Upcoming
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowHistory(true)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${showHistory ? "bg-primaryLite text-white" : "border"}`}
          >
            History
          </motion.button>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-cards rounded-xl shadow overflow-x-auto"
      >
        <table className="w-full text-sm">
          <thead className="bg-grayLite text-grayDark">
            <tr>
              <th className="p-4 text-center">Booking ID</th>
              <th className="p-4 text-center">Guest</th>
              <th className="p-4 text-center">Mobile</th>
              <th className="p-4 text-center">Room</th>
              <th className="p-4 text-center">Check In</th>
              <th className="p-4 text-center">Check Out</th>
              <th className="p-4 text-center">Nights</th>
              <th className="p-4 text-center">Guests</th>
              <th className="p-4 text-center">Status</th>
              {!showHistory && (
                <th className="p-4 text-center">Actions</th>
              )}
            </tr>
          </thead>

          <tbody>
            <AnimatePresence mode="wait">
              {(getAllBookingsAndHoldings.isLoading || getAllExpiredBookingsAndHoldings.isLoading) ? (
                // Loading skeleton
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <TableRowSkeleton key={`skeleton-${i}`} />
                  ))}
                </>
              ) : filteredData.length > 0 ? (
                // Data rows with animations
                filteredData.map((b, index) => (
                  <motion.tr
                    key={b._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ backgroundColor: "rgba(243, 244, 246, 0.4)" }}
                    className="border-b hover:bg-grayLite/40"
                  >
                    <td className="p-4 font-medium text-center">{b.bookingId}</td>
                    <td className="p-4 text-center">{b?.guest?.name || "-"}</td>
                    <td className="p-4 text-center">{b?.guest?.mobile || "-"}</td>
                    <td className="p-4 text-center">{b.roomId?.name}</td>
                    <td className="p-4 text-center">{formatDate(b.checkIn)}</td>
                    <td className="p-4 text-center">{formatDate(b.checkOut)}</td>
                    <td className="p-4 text-center">{calculateNights(b.checkIn, b.checkOut)}</td>
                    <td className="p-4 text-center">
                      {b.guests.adults} Adults{b.guests.children > 0 && `, ${b.guests.children} Children`}
                    </td>
                    <td className="p-4">
                      <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 + 0.1 }}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle[b.status?.toLowerCase()] || "bg-gray-100 text-gray-600"
                          }`}
                      >
                        {b.status?.toUpperCase()}
                      </motion.span>
                    </td>
                    {!showHistory && (
                      <td className="p-4 text-center flex justify-center gap-2">
                        {b.status === "HOLD" && (() => {
                          const disabled = isCancelDisabled(b.checkIn);

                          return (
                            <motion.button
                              whileHover={!disabled ? { scale: 1.05 } : {}}
                              whileTap={!disabled ? { scale: 0.95 } : {}}
                              onClick={() => {
                                if (disabled) {
                                  toast.error("Cannot cancel after check-in");
                                  return;
                                }
                                cancelAdminHoldings.mutate(b._id);
                              }}
                              className={`cursor-pointer text-sm ${disabled
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-red-500 hover:underline"
                                }`}
                            >
                              {cancelAdminHoldings.isPending ? "Cancelling..." : "Cancel"}
                            </motion.button>
                          );
                        })()}
                        {b.status === "CANCEL_REQUESTED" && (
                          <div className="flex flex-col gap-1">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => approveCancelBookings.mutate(b._id)}
                              className="text-green-600 text-sm hover:underline"
                            >
                              {approveCancelBookings.isPending ? "Approving..." : "Accept"}
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => rejectCancelBookings.mutate(b._id)}
                              className="text-red-500 text-sm hover:underline"
                            >
                              {rejectCancelBookings.isPending ? "Rejecting..." : "Reject"}
                            </motion.button>
                          </div>
                        )}
                      </td>
                    )}
                  </motion.tr>
                ))
              ) : (
                // Empty state
                <tr>
                  <td colSpan={showHistory ? "9" : "10"} className="p-6 text-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <Icon icon="mdi:inbox-outline" width="48" height="48" className="text-gray-400" />
                      <p className="text-grayDark">No records found</p>
                    </motion.div>
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
