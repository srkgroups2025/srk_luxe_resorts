"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import useRoom from "../../hooks/useRoom";
import { useBooking } from "@/app/context/BookingContext";
import { getDatesBetween } from "../../utils/getDatesBetween";
import AutoImageSlider from "@/components/AutoImageSlider";

// Skeleton Loader Component
const RoomCardSkeleton = () => (
  <motion.div
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{ duration: 2, repeat: Infinity }}
    className="border bg-white rounded-2xl shadow overflow-hidden"
  >
    <div className="h-56 w-full bg-gray-200 rounded-t-2xl" />
    <div className="p-6 space-y-3">
      <div className="h-6 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-10 bg-gray-200 rounded-xl" />
    </div>
  </motion.div>
);

export default function BookPage() {
  const router = useRouter();

  const { bookingData } = useBooking();
  const { getAllRooms } = useRoom();

  const { data: rooms = [] } = getAllRooms;

  const selectedDates = bookingData.checkIn
    ? getDatesBetween(bookingData.checkIn, bookingData.checkOut)
    : [];
  console.log('bookingData', bookingData)
  console.log('selectedDates', selectedDates)

  const formatDayWithMonth = (dateStr) => {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "short" }); // "Jan", "Feb", etc.
  return `${day} ${month}`;
};

  return (
    <div
      className="min-h-screen p-6 md:p-10"
    >
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold mb-10 text-center"
      >
        Choose Your Room
      </motion.h2>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
        {rooms.length === 0 ? (
          // Loading skeleton cards
          <>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <RoomCardSkeleton key={i} />
            ))}
          </>
        ) : (
          rooms.map((room, index) => {
            const booked = [
              ...(room.bookedDates || []),
              ...(room.holdDates || []),
            ];
            const availableDates = selectedDates.filter(
              (date) => !booked.includes(date)
            );

            const allAvailable =
              availableDates.length === selectedDates.length &&
              selectedDates.length > 0;

            const noneAvailable = availableDates.length === 0;

            return (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8, boxShadow: "0 12px 24px rgba(0,0,0,0.15)" }}
                className="border bg-white rounded-2xl shadow overflow-hidden cursor-pointer"
              >
                <motion.div
                  className="overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                >
                  <AutoImageSlider
                    images={room.images}
                    alt={room.name}
                    className="h-56 w-full object-cover"
                  />
                </motion.div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold">{room.name}</h3>
                  <p className="text-grayDark mb-2">
                    ₹ {room.price} / night
                  </p>

                  {/* Availability Status */}
                  {noneAvailable ? (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 text-red-600 text-sm mb-3"
                    >
                      <Icon icon="mdi:close-circle" width="16" height="16" />
                      Not Available
                    </motion.div>
                  ) : allAvailable ? (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 text-green-600 text-sm mb-3"
                    >
                      <Icon icon="mdi:check-circle" width="16" height="16" />
                      Available
                    </motion.div>
                  ) : (
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-green-600 text-sm mb-3"
                    >
                      Available dates:{" "}
                      {availableDates
                        .map(formatDayWithMonth)
                        .join(", ")}
                    </motion.p>
                  )}

                  <motion.button
                    onClick={() => router.push(`/book/${room.id}`)}
                    disabled={noneAvailable}
                    whileHover={!noneAvailable ? { scale: 1.02 } : {}}
                    whileTap={!noneAvailable ? { scale: 0.98 } : {}}
                    className={`w-full py-2 rounded-xl text-white flex items-center justify-center gap-2 ${noneAvailable
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-primaryLite hover:opacity-90"
                      }`}
                  >
                    <Icon icon="mdi:eye" width="18" height="18" />
                    View Details
                  </motion.button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}