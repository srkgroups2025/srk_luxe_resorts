"use client";
import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProfile } from "@/hooks/useUser";
import { useUserBookings } from "@/hooks/useBook";
import { toast } from "sonner";

// Skeleton Loader Components
const ProfileSkeleton = () => (
  <motion.div
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{ duration: 2, repeat: Infinity }}
    className="space-y-4"
  >
    <div className="flex gap-4">
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-200" />
      <div className="flex-1 space-y-2">
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-5 bg-gray-200 rounded w-2/3" />
        </div>
      ))}
    </div>
  </motion.div>
);

const BookingSkeleton = () => (
  <motion.div
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{ duration: 2, repeat: Infinity }}
    className="grid grid-cols-1 sm:grid-cols-4 gap-4 border rounded-xl p-4"
  >
    <div className="h-12 bg-gray-200 rounded" />
    <div className="h-12 bg-gray-200 rounded" />
    <div className="h-12 bg-gray-200 rounded" />
    <div className="h-12 bg-gray-200 rounded" />
  </motion.div>
);

export default function ProfilePage() {
  const { user, updateUser } = useProfile();
  const { getUserBookings, cancelRequestBooking } = useUserBookings();
  const {
    data: bookings = [],
    isLoading,
  } = getUserBookings;

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobileNumber: "",
  });

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  const openCancelModal = (booking) => {
    setSelectedBooking(booking);
    setCancelReason("");
    setCancelModalOpen(true);
  };

  const handleSendCancelRequest = () => {
    if (!cancelReason.trim()) {
      return toast.error("Invalid reason", {
        description: "Reason should not be empty",
      });
    };

    cancelRequestBooking.mutate(
      {
        bookingId: selectedBooking.bookingId,
        reason: cancelReason,
      },
      {
        onSuccess: () => {
          setCancelModalOpen(false);
        },
        onerror: (err) => {
          toast.error(err.message)
        }
      }
    );
  };

  // Sync form when user loads/changes
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        mobileNumber: user.mobileNumber || "",
      });
    }
  }, [user]);

  if (!user) return (
    <div className="min-h-screen pt-10 px-4 sm:px-8 bg-bgColor">
      <div className="mx-auto bg-cards rounded-2xl shadow p-6 sm:p-8 xl:p-12 max-w-6xl xl:max-w-7xl 2xl:max-w-[1400px]">
        <ProfileSkeleton />
      </div>
      <div className="mt-7 mx-auto bg-cards rounded-2xl shadow p-6 sm:p-8 xl:p-12 max-w-6xl xl:max-w-7xl 2xl:max-w-[1400px]">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <BookingSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    updateUser.mutate(form, {
      onSuccess: () => {
        setEditing(false);
      },
    });
  };
  // text length
  const truncateText = (text, length = 10) => {
    if (!text) return "";
    return text.length > length ? text.substring(0, length) + " " : text;
  };

  return (
    <div className="min-h-screen pt-10 px-4 sm:px-8 bg-bgColor">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto bg-cards rounded-2xl shadow p-6 sm:p-8 xl:p-12 max-w-6xl xl:max-w-7xl 2xl:max-w-[1400px] grid grid-cols-1 lg:grid-cols-3 gap-10"
      >

        {/* LEFT SECTION */}
        <div className="lg:col-span-2 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b pb-6">
            <motion.img
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              src={user.image || `https://avatar.iran.liara.run/username?username=${user.name}`}
              alt="Profile"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 object-cover lg:hidden"
            />
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center sm:text-left"
            >
              <h2 className="text-xl sm:text-2xl font-semibold">{user.name}</h2>
              <p className="text-grayDark break-all">{user.email || "-"}</p>
              {user.role === "admin" && (
                <motion.span
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="lg:hidden inline-flex items-center gap-2 mt-2 px-3 py-1 text-sm rounded-full bg-red text-white"
                >
                  <Icon icon="mdi:shield-account" className="w-4 h-4" />
                  Admin
                </motion.span>
              )}
            </motion.div>
          </div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {[
              { label: "Full Name", value: user.name },
              { label: "Email Address", value: user.email || "-" },
              { label: "Phone Number", value: user.mobileNumber || "-" },
              { label: "Member Since", value: new Date(user.createdAt).toDateString() },
              { label: "Total Bookings", value: user.totalBookings ?? 0 },
              { label: "Last Login", value: truncateText(user.lastLogin) ?? "-" }
            ].map((detail, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
              >
                <Detail label={detail.label} value={detail.value} />
              </motion.div>
            ))}
          </motion.div>

          {/* Actions */}
          <div className="mt-10 flex flex-col justify-end sm:flex-row gap-4">
            {/* <button onClick={() => setEditing(true)} className="max-w-[300px] flex-1 bg-buttons text-white py-2 rounded-xl hover:opacity-90 transition">
              Edit Profile
            </button> */}
          </div>
        </div>

        {/* RIGHT SECTION (DESKTOP) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="hidden lg:flex flex-col items-center justify-center gap-6"
        >
          <img src={user.image || `https://avatar.iran.liara.run/username?username=${user.name}`} alt="Profile" className="w-70 h-70 xl:w-90 xl:h-90 2xl:w-100 2xl:h-100 rounded-full object-cover shadow-md" />
          {user.role === "admin" && (
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-sm bg-primaryLite/10 text-primaryLite"
            >
              <Icon icon="mdi:shield-account" className="w-4 h-4" />
              Admin
            </motion.span>
          )}
        </motion.div>

        {/* Edit Modal */}
        <AnimatePresence>
          {editing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-white w-full max-w-md p-6 rounded-xl relative"
              >
                <h2 className="text-xl font-semibold mb-4 text-center">Edit Profile</h2>
                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Full Name" className="w-full mb-3 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primaryLite" />
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full mb-3 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primaryLite" />
                <input type="text" name="mobileNumber" value={form.mobileNumber} onChange={handleChange} placeholder="Phone Number" className="w-full mb-3 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primaryLite" />
                <div className="flex gap-4 mt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    className="flex-1 bg-buttons text-white py-2 rounded-xl hover:opacity-90 transition"
                  >
                    Save
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setEditing(false)}
                    className="flex-1 border border-buttons text-buttons py-2 rounded-xl hover:bg-buttons hover:text-white transition"
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-7 mx-auto bg-cards rounded-2xl shadow p-6 sm:p-8 xl:p-12 max-w-6xl xl:max-w-7xl 2xl:max-w-[1400px]"
      >
        <h2 className="text-xl sm:text-2xl font-semibold mb-6">
          Current Bookings
        </h2>

        {!isLoading ? (
          <>
            {bookings.length > 0 ? (
              <div className="space-y-5">
                {bookings.map((booking, index) => (
                  <motion.div
                    key={booking._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -2, boxShadow: "0 8px 16px rgba(0,0,0,0.1)" }}
                    className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center border rounded-xl p-4"
                  >
                    {/* Booking ID */}
                    <div>
                      <p className="text-sm text-grayDark">Booking ID</p>
                      <p className="font-medium">{booking.bookingId}</p>
                    </div>

                    {/* Check In */}
                    <div>
                      <p className="text-sm text-grayDark">Check In</p>
                      <p className="font-medium">
                        {new Date(booking.checkIn).toDateString()}
                      </p>
                    </div>

                    {/* Check Out */}
                    <div>
                      <p className="text-sm text-grayDark">Check Out</p>
                      <p className="font-medium">
                        {new Date(booking.checkOut).toDateString()}
                      </p>
                    </div>

                    {/* Cancel Button */}
                    <div className="flex sm:justify-end">
                      {booking.status === "BOOKED" && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openCancelModal(booking)}
                          className="px-4 py-2 rounded-lg bg-red text-white hover:opacity-90 transition"
                        >
                          Request Cancel
                        </motion.button>
                      )}

                      {booking.status === "CANCEL_REQUESTED" && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="px-4 py-2 rounded-lg bg-yellow-100 text-yellow-700 text-sm font-medium"
                        >
                          Cancel request sent
                        </motion.span>
                      )}

                      {booking.status === "CANCELLED" && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="px-4 py-2 rounded-lg bg-gray-200 text-gray-600 text-sm font-medium"
                        >
                          Cancelled
                        </motion.span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-10"
              >
                <Icon icon="mdi:inbox-outline" width="48" height="48" className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No bookings yet</p>
              </motion.div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <BookingSkeleton key={i} />
            ))}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {cancelModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-6 rounded-xl w-full max-w-md"
            >
              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  Cancel Booking
                </h3>
                <h3 className="text-lg font-semibold">
                  {selectedBooking?.bookingId || "-"}
                </h3>
              </div>

              <textarea
                className="w-full border rounded-lg p-2 mb-4"
                rows="4"
                placeholder="Enter cancel reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSendCancelRequest}
                  className="flex-1 bg-red text-white py-2 rounded-lg"
                >
                  Send Request
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCancelModalOpen(false)}
                  className="flex-1 border py-2 rounded-lg"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-sm text-grayDark mb-1">{label}</p>
      <p className="font-medium text-base sm:text-lg break-all">{value}</p>
    </div>
  );
}
