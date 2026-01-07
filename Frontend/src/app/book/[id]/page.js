"use client";

import { useParams, useRouter } from "next/navigation";
import useRoom from "../../../hooks/useRoom";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import { useBooking } from "@/app/context/BookingContext";
import DateRangeDropdown from "./../../../components/DateRangePicker";
import { getDatesBetween } from "../../../utils/getDatesBetween";
import { useCreateAndHoldBooking } from "../../../hooks/useBook";
import { getPermissions } from "@/lib/permissions";
import { usePayment } from "../../../hooks/usePayment";
import { processPayment } from "@/utils/payment";
import { toast } from "sonner";

// Loading Spinner Component
const LoadingSpinner = () => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    className="inline-block"
  >
    <Icon icon="mdi:loading" className="text-white" width="20" height="20" />
  </motion.div>
);

// Skeleton Loader Component
const SkeletonLoader = () => (
  <motion.div
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{ duration: 2, repeat: Infinity }}
    className="bg-gray-200 rounded-xl"
  />
);

export default function RoomDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  // API calls
  const { createOrder, isCreatingOrder, verifyPayment, isVerifying } = usePayment();
  const { holdBooking, isHolding, createBooking, isLoading } = useCreateAndHoldBooking();
  const { getAllRooms } = useRoom();
  const { bookingData, setBookingData } = useBooking();

  const { data: rooms = [] } = getAllRooms;
  const room = rooms.find((r) => String(r.id) === id);

  const [activeImg, setActiveImg] = useState(room?.images[0]);
  const [openCalendar, setOpenCalendar] = useState(false);

  // User Info
  const [userInfo, setUserInfo] = useState(null);
  const [loginStatus, setLoginStatus] = useState(false);
  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      setUserInfo(JSON.parse(storedUser));
      setLoginStatus(true);
    }
  }, []);
  const permissions = getPermissions(userInfo);

  // Range state: always defaults to safe object
  const [range, setRange] = useState({
    from: bookingData.checkIn ? new Date(bookingData.checkIn) : undefined,
    to: bookingData.checkOut ? new Date(bookingData.checkOut) : undefined,
  });

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-center"
        >
          <Icon icon="mdi:information" width="48" height="48" className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Room not found</p>
        </motion.div>
      </div>
    );
  }

  /* ---------- Availability Logic ---------- */

  const selectedDates =
    range && range.from && range.to
      ? getDatesBetween(range.from, range.to)
      : [];

  const bookedDates = [
    ...(room.bookedDates || []),
    ...(room.holdDates || []),
  ];

  const availableDates = selectedDates.filter(
    (date) => !bookedDates.includes(date)
  );

  const allAvailable =
    selectedDates.length > 0 &&
    availableDates.length === selectedDates.length;

  const noneAvailable =
    selectedDates.length > 0 &&
    availableDates.length === 0;

  const totalNights = selectedDates.length;

  const formatDayWithMonth = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    return `${day} ${month}`;
  };

  const handleApplyDates = () => {
    if (!range.from || !range.to) return;

    setBookingData((prev) => ({
      ...prev,
      checkIn: range.from.toISOString(),
      checkOut: range.to.toISOString(),
    }));

    setOpenCalendar(false);
  };

  /* ---------- GUEST LOGIC ---------- */
  const totalGuests = (bookingData.adults || 0) + (bookingData.children || 0);
  const exceedsGuestLimit = totalGuests > room.maxGuest;

  /* ---------- PRICE CALCULATION ---------- */
  const baseAmount = totalNights * room.price;
  const taxAmount = (baseAmount * room.gst) / 100;
  const totalAmount = baseAmount + taxAmount;

  const isDateInvalid =
    selectedDates.length === 0 ||
    availableDates.length !== selectedDates.length;

  const isBookingDisabled =
    isLoading || totalNights === 0 || exceedsGuestLimit || isDateInvalid;

  /* ---------- PAYMENT HANDLER ---------- */
  const handlePayment = async () => {
    try {
      if (!range.from || !range.to) return;
      if (exceedsGuestLimit) return;

      if (!userInfo) {
        toast.error("Please login to continue");
        return;
      }

      /* 1️⃣ Create Razorpay Order */
      const orderRes = await createOrder.mutateAsync({
        totalAmount,
      });

      const { orderId, amount, currency, keyId } = orderRes;

      if (!orderId) throw new Error("Order ID not found");

      /* 2️⃣ Open Razorpay Checkout */
      await processPayment({
        verifyPayment:verifyPayment.mutateAsync,
        orderId,
        amount: Number(amount),
        currency,
        userInfo,
        keyId,

        /* 3️⃣ After payment verified → create booking */
        onSuccess: async () => {
          const payload = {
            roomId: room.id,
            checkIn: range.from.toISOString(),
            checkOut: range.to.toISOString(),
            bookingDates: selectedDates,
            guest: {
              name: userInfo.name,
              email: userInfo.email,
              mobile: userInfo.mobileNumber,
            },
            guests: {
              adults: bookingData.adults,
              children: bookingData.children,
            },
            nights: totalNights,
            pricePerNight: room.price,
            gst: room.gst,
            totalAmount,
            status: "BOOKED",
          };

          await createBooking.mutateAsync(payload);
          toast.success("Booking confirmed 🎉");
          router.push("/profile");
        },

        onFailure: () => {
          toast.error("Payment failed or cancelled");
        },
      });
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  /* ---------- HOLD DATES HANDLER (ADMIN) ---------- */
  const handleHoldDates = () => {
    if (!range.from || !range.to) return;

    const payload = {
      roomId: room.id,
      checkIn: range.from.toISOString(),
      checkOut: range.to.toISOString(),
      bookingDates: selectedDates,
      nights: totalNights,
      guests: {
        adults: bookingData.adults,
        children: bookingData.children,
      },
      type: "HOLD",
    };

    holdBooking.mutateAsync(payload, {
      onSuccess: () => {
        router.refresh();
      },
    });
  };

  return (
    <div
      className="min-h-screen p-6 md:p-10 max-w-7xl mx-auto"
    >
      {/* Back */}
      <motion.button
        onClick={() => router.back()}
        whileHover={{ x: -5 }}
        className="flex items-center gap-2 text-primaryLite mb-6"
      >
        <Icon icon="mdi:arrow-left" />
        Back
      </motion.button>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Images */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img
            src={activeImg}
            alt={room.name}
            className="w-full h-[400px] object-cover rounded-2xl mb-4"
          />

          <div className="flex gap-3 overflow-x-auto">
            {room.images.map((img) => (
              <motion.img
                key={img}
                src={img}
                alt=""
                onClick={() => setActiveImg(img)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`h-20 w-24 object-cover rounded-xl cursor-pointer border-2 ${activeImg === img
                  ? "border-primaryLite"
                  : "border-transparent"
                  }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-2">{room.name}</h1>
          <p className="text-xl text-primaryLite font-semibold mb-4">
            ₹ {room.price} / night
          </p>

          {/* Date Selection */}
          <div className="mb-6">
            <label className="text-sm text-grayDark mb-1 block">
              Selected Dates
            </label>

            <motion.div
              onClick={() => setOpenCalendar(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="border rounded-xl px-4 py-3 cursor-pointer flex justify-between items-center"
            >
              {range?.from && range?.to ? (
                <div>
                  {range.from.toLocaleDateString("en-GB")} —{" "}
                  {range.to.toLocaleDateString("en-GB")}
                </div>
              ) : (
                <span className="text-gray-400">Select dates</span>
              )}
              📅
            </motion.div>

            <DateRangeDropdown
              open={openCalendar}
              onClose={() => setOpenCalendar(false)}
              range={range}
              setRange={setRange}
              minDate={new Date()}
              onApply={handleApplyDates}
            />

            {noneAvailable ? (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 text-sm mt-2"
              >
                Not available
              </motion.p>
            ) : allAvailable ? (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-green-600 text-sm mt-2"
              >
                Available
              </motion.p>
            ) : totalNights > 0 ? (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-green-600 text-sm mt-2"
              >
                Available dates:{" "}
                {availableDates.map(formatDayWithMonth).join(", ")}
              </motion.p>
            ) : null}
          </div>

          {exceedsGuestLimit && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 p-3 rounded-xl my-3"
            >
              <p className="text-red-600 text-sm">
                This room allows a maximum of {room.maxGuest} guests.
                You selected {totalGuests}.
              </p>
            </motion.div>
          )}

          {/* Amenities */}
          <h3 className="text-lg font-semibold mb-3">Amenities</h3>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {room.amenities.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2 text-grayDark"
              >
                <Icon icon="mdi:check-circle-outline" className="text-green-500" />
                {a}
              </motion.div>
            ))}
          </div>

          {/* PRICE BREAKDOWN */}
          {totalNights > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border rounded-xl p-4 mb-6 bg-gray-50"
            >
              <h3 className="font-semibold mb-3">Price Details</h3>

              <div className="flex justify-between text-sm mb-2">
                <span>
                  ₹ {room.price} × {totalNights}{" "}
                  {totalNights === 1 ? "night" : "nights"}
                </span>
                <span>₹ {baseAmount}</span>
              </div>

              <div className="flex justify-between text-sm mb-2">
                <span>Taxes ({room.gst}%)</span>
                <span>₹ {taxAmount.toFixed(2)}</span>
              </div>

              <hr className="my-2" />

              <div className="flex justify-between font-semibold">
                <span>Total Price</span>
                <span>₹ {totalAmount.toFixed(2)}</span>
              </div>
            </motion.div>
          )}

          {/* CTA */}
          <div className="flex gap-4">
            {/* CUSTOMER BOOKING */}
            <motion.button
              type="button"
              disabled={isBookingDisabled}
              onClick={handlePayment}
              whileHover={!isBookingDisabled ? { scale: 1.02 } : {}}
              whileTap={!isBookingDisabled ? { scale: 0.98 } : {}}
              className={`w-full py-3 rounded-xl text-lg text-white flex items-center justify-center gap-2 ${isBookingDisabled
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primaryLite hover:opacity-90"
                }`}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  Booking...
                </>
              ) : (
                "Book Now"
              )}
            </motion.button>

            {/* ADMIN HOLD */}
            {permissions.admin && (
              <motion.button
                type="button"
                disabled={totalNights === 0 || isHolding}
                onClick={handleHoldDates}
                whileHover={!(isBookingDisabled || totalNights === 0) ? { scale: 1.02 } : {}}
                whileTap={!(isBookingDisabled || totalNights === 0) ? { scale: 0.98 } : {}}
                className={`w-full py-3 rounded-xl text-lg text-white flex items-center justify-center gap-2 ${isBookingDisabled || totalNights === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-yellow-600 hover:opacity-90"
                  }`}
              >
                {isHolding ? (
                  <>
                    <LoadingSpinner />
                    Holding...
                  </>
                ) : (
                  "Hold Dates"
                )}
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
