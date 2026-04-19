"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
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
  const { holdBooking, isHolding, createPendingBooking, confirmBooking, cancelPendingBooking, isCreateLoading, isConfirmLoading, isCancelLoading } = useCreateAndHoldBooking();
  const { getAllRooms } = useRoom();
  const { bookingData, setBookingData } = useBooking();

  const { data: rooms = [] } = getAllRooms;
  const room = rooms.find((r) => String(r.id) === id);

  const [activeImg, setActiveImg] = useState(room?.images[0]);
  const [openCalendar, setOpenCalendar] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerNumber, setCustomerNumber] = useState("");
  const [isBookingProcessing, setIsBookingProcessing] = useState(false);

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
    isCancelLoading || isConfirmLoading || isCreateLoading || isBookingProcessing || totalNights === 0 || exceedsGuestLimit || isDateInvalid;

  /* ---------- PAYMENT HANDLER ---------- */
  const handlePayment = async () => {
    try {
      if (!range.from || !range.to) return;
      if (exceedsGuestLimit) return;

      if (!userInfo) {
        toast.error("Please login to continue");
        return;
      }

      setIsBookingProcessing(true);

      /* 1️⃣ CREATE PENDING BOOKING */
      const pendingRes = await createPendingBooking.mutateAsync({
        roomId: room.id,
        checkIn: range.from.toISOString(),
        checkOut: range.to.toISOString(),
        bookingDates: selectedDates,
        guests: {
          adults: bookingData.adults,
          children: bookingData.children,
        },
        nights: totalNights,
        pricePerNight: room.price,
        gst: room.gst,
        totalAmount,
      });

      const bookingId = pendingRes.bookingId;

      /* 2️⃣ CREATE PAYMENT ORDER */
      const orderRes = await createOrder.mutateAsync({
        totalAmount,
        bookingId,
      });

      const { orderId, amount, currency, keyId } = orderRes;

      /* 3️⃣ OPEN RAZORPAY */
      await processPayment({
        verifyPayment: verifyPayment.mutateAsync,
        orderId,
        amount: Number(amount),
        currency,
        keyId,
        userInfo,

        /* 4️⃣ PAYMENT SUCCESS → CONFIRM BOOKING */
        onSuccess: async () => {
          toast.success("Payment successful! Confirming booking...");
          setTimeout(() => {
            setIsBookingProcessing(false);
            router.push("/profile");
          }, 2000);
        },

        /* 5️⃣ PAYMENT FAILED → DELETE PENDING BOOKING */
        onFailure: async () => {
          await cancelPendingBooking.mutateAsync(bookingId);
          toast.error("Payment failed. Booking released.");
          setTimeout(() => {
            setIsBookingProcessing(false);
          }, 1500);
        },
      });
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Something went wrong");
      setIsBookingProcessing(false);
    }
  };

  /* ---------- HOLD DATES HANDLER (ADMIN) ---------- */
  const handleHoldDates = () => {
    if (!range.from || !range.to) return;

    const guestName = customerName.trim();
    const guestMobile = customerNumber.trim();
    const guestMobileDigits = guestMobile.replace(/\D/g, "");

    if (!guestName || guestMobileDigits.length !== 10) {
      toast.error("Please enter the customer name and a 10-digit number");
      return;
    }

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
      guest: {
        name: guestName,
        mobile: guestMobileDigits,
      },
      type: "HOLD",
    };

    holdBooking.mutateAsync(payload, {
      onSuccess: () => {
        router.push("/admin-panel/bookings");
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
          <div className="relative w-full h-[400px] rounded-2xl mb-4 overflow-hidden">
            <Image
              src={activeImg}
              alt={room.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              preload
            />
          </div>

          <div className="flex gap-3 overflow-x-auto">
            {room.images.map((img) => (
              <motion.div
                key={img}
                onClick={() => setActiveImg(img)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative h-20 w-24 overflow-hidden rounded-xl cursor-pointer border-2 ${activeImg === img
                  ? "border-primaryLite"
                  : "border-transparent"
                  }`}
              >
                <Image
                  src={img}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-20"
        >
          <h1 className="text-3xl font-bold mb-2">{room.name}</h1>
          <p className="text-xl text-primaryLite font-semibold mb-4">
            ₹ {room.price} / night
          </p>

          {/* Date Selection */}
          <div className="relative z-30 mb-6">
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

          {permissions.admin && (
            <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-900">
                  Hold Customer Details
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Enter the guest details that should appear on the hold booking.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-black/5"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
                    Customer Number
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={customerNumber}
                    maxLength={10}
                    onChange={(e) =>
                      setCustomerNumber(
                        e.target.value.replace(/\D/g, "").slice(0, 10)
                      )
                    }
                    placeholder="Enter mobile number"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-black/5"
                  />
                </div>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="flex gap-4">
            {/* CUSTOMER BOOKING */}
            {!permissions.admin && (
              <motion.button
                type="button"
                disabled={isBookingDisabled}
                onClick={handlePayment}
                whileHover={!isBookingDisabled ? { scale: 1.02 } : {}}
                whileTap={!isBookingDisabled ? { scale: 0.98 } : {}}
                className={`w-full py-3 rounded-xl text-lg text-white flex items-center justify-center gap-2 ${isBookingDisabled
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primaryLite cursor-pointer hover:opacity-90"
                  }`}
              >
                {isBookingProcessing ? (
                  <>
                    <LoadingSpinner />
                    Booking...
                  </>
                ) : (
                  "Book Now"
                )}
              </motion.button>
            )}

            {/* ADMIN HOLD */}
            {permissions.admin && (
              <motion.button
                type="button"
                disabled={
                  isBookingDisabled ||
                  totalNights === 0 ||
                  isHolding ||
                  !customerName.trim() ||
                  customerNumber.replace(/\D/g, "").length !== 10
                }
                onClick={handleHoldDates}
                whileHover={!(isBookingDisabled || totalNights === 0 || isHolding || !customerName.trim() || customerNumber.replace(/\D/g, "").length !== 10) ? { scale: 1.02 } : {}}
                whileTap={!(isBookingDisabled || totalNights === 0 || isHolding || !customerName.trim() || customerNumber.replace(/\D/g, "").length !== 10) ? { scale: 0.98 } : {}}
                className={`w-full py-3 rounded-xl text-lg text-white flex items-center justify-center gap-2 ${isBookingDisabled || totalNights === 0 || isHolding || !customerName.trim() || customerNumber.replace(/\D/g, "").length !== 10
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-yellow-600 cursor-pointer hover:opacity-90"
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
