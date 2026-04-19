"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import useRoom from "../../hooks/useRoom";
import { useBooking } from "@/app/context/BookingContext";
import { getDatesBetween } from "../../utils/getDatesBetween";
import AutoImageSlider from "@/components/AutoImageSlider";

const RoomCardSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border bg-white shadow">
    <div className="h-56 w-full animate-pulse bg-gray-200" />
    <div className="space-y-3 p-6">
      <div className="h-6 w-3/4 rounded bg-gray-200" />
      <div className="h-4 w-1/2 rounded bg-gray-200" />
      <div className="h-4 w-full rounded bg-gray-200" />
      <div className="h-10 rounded-xl bg-gray-200" />
    </div>
  </div>
);

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path
        fillRule="evenodd"
        d="M16.704 5.296a1 1 0 0 1 0 1.408l-7.2 7.2a1 1 0 0 1-1.408 0l-3.6-3.6a1 1 0 1 1 1.408-1.408l2.896 2.896 6.496-6.496a1 1 0 0 1 1.408 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path
        fillRule="evenodd"
        d="M4.293 4.293a1 1 0 0 1 1.414 0L10 8.586l4.293-4.293a1 1 0 1 1 1.414 1.414L11.414 10l4.293 4.293a1 1 0 0 1-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L8.586 10 4.293 5.707a1 1 0 0 1 0-1.414Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12s3.75-7.5 9.75-7.5S21.75 12 21.75 12s-3.75 7.5-9.75 7.5S2.25 12 2.25 12Z"
      />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function BookPage() {
  const router = useRouter();
  const [viewingRoomId, setViewingRoomId] = useState(null);

  const { bookingData } = useBooking();
  const { getAllRooms } = useRoom();

  const { data: rooms = [] } = getAllRooms;

  const selectedDates = bookingData.checkIn
    ? getDatesBetween(bookingData.checkIn, bookingData.checkOut)
    : [];

  const formatDayWithMonth = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    return `${day} ${month}`;
  };

  const handleViewDetails = (roomId) => {
    if (viewingRoomId) return;

    setViewingRoomId(roomId);
    window.setTimeout(() => {
      router.push(`/book/${roomId}`);
    }, 0);
  };

  return (
    <div className="min-h-screen p-6 md:p-10">
      <h2 className="mb-10 text-center text-3xl font-bold">Choose Your Room</h2>

      <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
        {rooms.length === 0 ? (
          <>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <RoomCardSkeleton key={i} />
            ))}
          </>
        ) : (
          rooms.map((room) => {
            const booked = [...(room.bookedDates || []), ...(room.holdDates || [])];

            const availableDates = selectedDates.filter((date) => !booked.includes(date));

            const allAvailable =
              availableDates.length === selectedDates.length && selectedDates.length > 0;

            const noneAvailable = availableDates.length === 0;

            return (
              <div
                key={room.id}
                className="overflow-hidden rounded-2xl border bg-white shadow"
              >
                <AutoImageSlider
                  images={room.images}
                  alt={room.name}
                  className="h-56 w-full object-cover"
                />

                <div className="p-6">
                  <h3 className="text-xl font-semibold">{room.name}</h3>
                  <p className="mb-2 text-grayDark">INR {room.price} / night</p>

                  {selectedDates.length === 0 ? (
                    <p className="mb-3 text-sm text-yellow-600">
                      Please select Dates
                    </p>
                  ) : noneAvailable ? (
                    <div className="mb-3 flex items-center gap-2 text-sm text-red-600">
                      <CloseIcon />
                      Not Available
                    </div>
                  ) : allAvailable ? (
                    <div className="mb-3 flex items-center gap-2 text-sm text-green-600">
                      <CheckIcon />
                      Available
                    </div>
                  ) : (
                    <p className="mb-3 text-sm text-green-600">
                      Available dates: {availableDates.map(formatDayWithMonth).join(", ")}
                    </p>
                  )}

                  <button
                    onClick={() => handleViewDetails(room.id)}
                    disabled={noneAvailable || viewingRoomId === room.id}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl py-2 text-white transition-transform duration-200 ${noneAvailable || viewingRoomId === room.id
                        ? "cursor-not-allowed bg-gray-400"
                        : "cursor-pointer bg-primaryLite hover:scale-[1.02] hover:opacity-90"
                      }`}
                  >
                    <EyeIcon />
                    {viewingRoomId === room.id ? "Viewing..." : "View Details"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
