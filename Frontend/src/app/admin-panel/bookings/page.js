"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { getDatesBetween } from "../../../utils/getDatesBetween";
import { useAdminBookings } from "../../../hooks/useBook";

const PAGE_SIZE = 10;
const DEBOUNCE_MS = 350;

const INITIAL_FILTERS = {
  bookingId: "",
  guestName: "",
  mobile: "",
  roomName: "",
  checkIn: "",
  checkOut: "",
  nights: "",
  guestsAdults: "",
  guestsChildren: "",
  status: "",
};

const TableRowSkeleton = ({ showHistory }) => (
  <motion.tr
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{ duration: 2, repeat: Infinity }}
    className="border-b"
  >
    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].slice(0, showHistory ? 9 : 10).map((i) => (
      <td key={i} className="p-4">
        <div className="h-4 w-full rounded bg-gray-200" />
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

const FILTER_FIELDS = [
  { key: "bookingId", label: "Booking ID", type: "text", placeholder: "Search booking" },
  { key: "guestName", label: "Guest", type: "text", placeholder: "Search guest" },
  { key: "mobile", label: "Mobile", type: "text", placeholder: "Search mobile" },
  { key: "roomName", label: "Room", type: "text", placeholder: "Search room" },
  { key: "checkIn", label: "Check In", type: "date" },
  { key: "checkOut", label: "Check Out", type: "date" },
  { key: "nights", label: "Nights", type: "number", placeholder: "Nights" },
];

const isCancelDisabled = (checkIn) => {
  const now = new Date();
  const checkInDate = new Date(checkIn);
  checkInDate.setHours(12, 0, 0, 0);
  return now >= checkInDate;
};

const hasActiveFilters = (filters) =>
  Object.values(filters).some((value) => String(value ?? "").trim() !== "");

const statusOptions = (showHistory) =>
  showHistory
    ? [
        { label: "All", value: "" },
        { label: "EXPIRED", value: "EXPIRED" },
      ]
    : [
        { label: "All", value: "" },
        { label: "BOOKED", value: "BOOKED" },
        { label: "HOLD", value: "HOLD" },
        { label: "CANCEL_REQUESTED", value: "CANCEL_REQUESTED" },
        { label: "CANCELLED", value: "CANCELLED" },
      ];

export default function BookingsPage() {
  const [showHistory, setShowHistory] = useState(false);
  const [showCancelReason, setShowCancelReason] = useState(false);
  const [currentCancelReason, setCurrentCancelReason] = useState("");
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [debouncedFilters, setDebouncedFilters] = useState(INITIAL_FILTERS);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedFilters(filters);
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [filters]);

  useEffect(() => {
    setUpcomingPage(1);
    setHistoryPage(1);
  }, [debouncedFilters]);

  const {
    getAllBookingsAndHoldings,
    getAllExpiredBookingsAndHoldings,
    cancelAdminHoldings,
    approveCancelBookings,
    rejectCancelBookings,
  } = useAdminBookings({
    enabledUpcoming: !showHistory,
    enabledHistory: showHistory,
    upcomingPage,
    historyPage,
    limit: PAGE_SIZE,
    filters: debouncedFilters,
  });

  const activeQuery = showHistory
    ? getAllExpiredBookingsAndHoldings
    : getAllBookingsAndHoldings;

  const currentPage = showHistory ? historyPage : upcomingPage;
  const activeResponse = activeQuery.data;
  const bookings = Array.isArray(activeResponse?.data) ? activeResponse.data : [];
  const totalCount = activeResponse?.count ?? 0;
  const totalPages = activeResponse?.totalPages ?? 0;
  const hasRows = bookings.length > 0;
  const showSkeleton = activeQuery.isLoading && !hasRows;

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const calculateNights = (booking) => {
    if (typeof booking?.nights === "number") {
      return booking.nights;
    }

    const dates = getDatesBetween(booking.checkIn, booking.checkOut);
    return dates.length;
  };

  const handleTabChange = (nextHistory) => {
    setShowHistory(nextHistory);
    setFilters(INITIAL_FILTERS);
    setDebouncedFilters(INITIAL_FILTERS);
    setUpcomingPage(1);
    setHistoryPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setUpcomingPage(1);
    setHistoryPage(1);
  };

  const clearFilters = () => {
    setFilters(INITIAL_FILTERS);
    setDebouncedFilters(INITIAL_FILTERS);
    setUpcomingPage(1);
    setHistoryPage(1);
  };

  const goToPreviousPage = () => {
    if (showHistory) {
      setHistoryPage((page) => Math.max(page - 1, 1));
      return;
    }
    setUpcomingPage((page) => Math.max(page - 1, 1));
  };

  const goToNextPage = () => {
    if (totalPages === 0 || currentPage >= totalPages) return;
    if (showHistory) {
      setHistoryPage((page) => Math.min(page + 1, totalPages));
      return;
    }
    setUpcomingPage((page) => Math.min(page + 1, totalPages));
  };

  const currentStatusOptions = useMemo(() => statusOptions(showHistory), [showHistory]);
  const anyFiltersActive = hasActiveFilters(filters);

  return (
    <div className="min-h-screen bg-bgColor px-6 pt-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row"
      >
        <h1 className="text-3xl font-bold text-primaryLite">
          {showHistory ? "Booking History" : "Upcoming Bookings"}
        </h1>

        <div className="flex w-full gap-3 sm:w-auto">
          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleTabChange(false)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 cursor-pointer ${
              !showHistory ? "bg-primaryLite text-white" : "border"
            }`}
          >
            Upcoming
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleTabChange(true)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 cursor-pointer ${
              showHistory ? "bg-primaryLite text-white" : "border"
            }`}
          >
            History
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearFilters}
            disabled={!anyFiltersActive}
            className="whitespace-nowrap rounded-lg border px-4 py-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
          >
            Reset Filters
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="overflow-x-auto rounded-xl bg-cards shadow"
      >
        <table className="w-full min-w-[1200px] text-sm">
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
              {!showHistory && <th className="p-4 text-center">Actions</th>}
            </tr>

            <tr className="border-t border-gray-200 bg-white/70">
              {FILTER_FIELDS.map((field) => (
                <th key={field.key} className="p-2 align-top">
                  {field.type === "date" ? (
                    <input
                      type="date"
                      value={filters[field.key]}
                      onChange={(e) => handleFilterChange(field.key, e.target.value)}
                      className="w-full rounded-md border px-2 py-1 text-xs outline-none focus:border-primaryLite"
                    />
                  ) : (
                    <input
                      type={field.type}
                      min={field.type === "number" ? "0" : undefined}
                      placeholder={field.placeholder}
                      value={filters[field.key]}
                      onChange={(e) => handleFilterChange(field.key, e.target.value)}
                      className="w-full rounded-md border px-2 py-1 text-xs outline-none focus:border-primaryLite"
                    />
                  )}
                </th>
              ))}

              <th className="p-2 align-top">
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Adults"
                    value={filters.guestsAdults}
                    onChange={(e) => handleFilterChange("guestsAdults", e.target.value)}
                    className="w-1/2 rounded-md border px-2 py-1 text-xs outline-none focus:border-primaryLite"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Children"
                    value={filters.guestsChildren}
                    onChange={(e) => handleFilterChange("guestsChildren", e.target.value)}
                    className="w-1/2 rounded-md border px-2 py-1 text-xs outline-none focus:border-primaryLite"
                  />
                </div>
              </th>

              <th className="p-2 align-top">
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full rounded-md border px-2 py-1 text-xs outline-none focus:border-primaryLite"
                >
                  {currentStatusOptions.map((option) => (
                    <option key={option.value || "all"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </th>

              {!showHistory && <th className="p-2 align-top" />}
            </tr>
          </thead>

          <tbody>
            <AnimatePresence mode="wait">
              {showSkeleton ? (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <TableRowSkeleton key={`skeleton-${i}`} showHistory={showHistory} />
                  ))}
                </>
              ) : hasRows ? (
                bookings.map((b, index) => (
                  <motion.tr
                    key={b._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ backgroundColor: "rgba(243, 244, 246, 0.4)" }}
                    className="border-b hover:bg-grayLite/40"
                  >
                    <td className="p-4 text-center font-medium">{b.bookingId}</td>
                    <td className="p-4 text-center">{b?.guest?.name || "-"}</td>
                    <td className="p-4 text-center">{b?.guest?.mobile || "-"}</td>
                    <td className="p-4 text-center">{b.roomId?.name || "-"}</td>
                    <td className="p-4 text-center">{formatDate(b.checkIn)}</td>
                    <td className="p-4 text-center">{formatDate(b.checkOut)}</td>
                    <td className="p-4 text-center">{calculateNights(b)}</td>
                    <td className="p-4 text-center">
                      {(b.guests?.adults ?? 0)} Adults
                      {(b.guests?.children ?? 0) > 0 &&
                        `, ${b.guests.children} Children`}
                    </td>
                    <td className="p-4">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 + 0.1 }}
                        className={`flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${
                          statusStyle[b.status?.toLowerCase()] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <span>{b.status?.toUpperCase()}</span>
                        {b.status === "CANCEL_REQUESTED" && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setCurrentCancelReason(b.cancelReason);
                              setShowCancelReason(true);
                            }}
                            className="cursor-pointer rounded-full p-1 text-blue-600 hover:bg-blue-100"
                            title="View Cancel Reason"
                          >
                            <Icon icon="mdi:information-outline" width={20} height={20} />
                          </motion.button>
                        )}
                      </motion.div>
                    </td>
                    {!showHistory && (
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          {b.status === "HOLD" &&
                            (() => {
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
                                  className={`cursor-pointer text-sm ${
                                    disabled
                                      ? "cursor-not-allowed text-gray-400"
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
                                className="cursor-pointer text-sm text-green-600 hover:underline"
                              >
                                {approveCancelBookings.isPending ? "Approving..." : "Accept"}
                              </motion.button>

                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => rejectCancelBookings.mutate(b._id)}
                                className="cursor-pointer text-sm text-red-500 hover:underline"
                              >
                                {rejectCancelBookings.isPending ? "Rejecting..." : "Reject"}
                              </motion.button>
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={showHistory ? "9" : "10"} className="p-6 text-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <Icon
                        icon="mdi:inbox-outline"
                        width="48"
                        height="48"
                        className="text-gray-400"
                      />
                      <p className="text-grayDark">No Data Found</p>
                    </motion.div>
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>

        <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-end">
          <div className="flex flex-wrap items-center justify-end gap-3 text-sm text-gray-600">
            <span>Total count: {totalCount}</span>
            <span>Total pages: {totalPages}</span>
            <span>
              Page {totalPages === 0 ? 0 : currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={goToPreviousPage}
              disabled={currentPage <= 1 || totalPages === 0}
              className="rounded-md  cursor-pointer border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={goToNextPage}
              disabled={currentPage >= totalPages || totalPages === 0}
              className="rounded-md  cursor-pointer border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showCancelReason && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCancelReason(false)}
          >
            <motion.div
              className="w-80 max-w-full rounded-xl bg-white p-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="mb-4 text-xl font-semibold">Cancel Reason</h2>
              <p className="text-gray-700">
                {currentCancelReason || "No reason provided."}
              </p>
              <button
                className="mt-6 w-full cursor-pointer rounded-xl bg-primaryLite py-2 text-white hover:opacity-90"
                onClick={() => setShowCancelReason(false)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
