"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useBooking } from "@/app/context/BookingContext";
import DateRangeDropdown from "./DateRangePicker";

export default function CheckAvailability() {
  const router = useRouter();
  const { setBookingData } = useBooking();

  const [range, setRange] = useState({ from: undefined, to: undefined });
  const [openCalendar, setOpenCalendar] = useState(false);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  /* ---------------- HELPERS ---------------- */

  // Force time to 12:00 PM (hotel standard)
  const setNoonTime = (date) => {
    const d = new Date(date);
    d.setHours(12, 0, 0, 0); // 👈 12:00 PM
    return d;
  };

  // UI display only (DD/MM/YYYY)
  const formatUI = (date) =>
    date.toLocaleDateString("en-GB");

  // Prevent selecting past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  /* ---------------- HANDLER ---------------- */

  const handleCheck = () => {
    if (!range.from || !range.to) {
      toast.error("Please select check-in and check-out dates");
      return;
    }

    const checkInDate = setNoonTime(range.from);
    const checkOutDate = setNoonTime(range.to);

    if (checkOutDate <= checkInDate) {
      toast.error("Check-out must be after check-in");
      return;
    }

    setBookingData({
      checkIn: checkInDate.toISOString(),   // UTC safe
      checkOut: checkOutDate.toISOString(), // UTC safe
      adults,
      children,
    });

    router.push("/book");
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="mt-8 bg-white rounded-2xl p-6 shadow">
      <div className="grid md:grid-cols-[2fr_1fr_1fr_auto] gap-6 items-end">

        {/* DATE RANGE */}
        <div className="relative">
          <label className="text-xs mb-1 block">
            Check-in / Check-out (12 PM – 12 PM)
          </label>

          <div
            onClick={() => setOpenCalendar(true)}
            className="border rounded-xl px-4 py-3 cursor-pointer flex justify-between items-center"
          >
            {range?.from && range?.to ? (
              <span>
                {formatUI(range.from)} — {formatUI(range.to)}
              </span>
            ) : (
              <span className="text-gray-400">Select dates</span>
            )}
            📅
          </div>

          <DateRangeDropdown
            open={openCalendar}
            onClose={() => setOpenCalendar(false)}
            range={range}
            setRange={setRange}
            minDate={today}
          />
        </div>

        {/* ADULTS */}
        <div>
          <label className="text-xs mb-1 block">Adults</label>
          <select
            value={adults}
            onChange={(e) => setAdults(Number(e.target.value))}
            className="border rounded-xl px-3 py-2 w-full"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        {/* CHILDREN */}
        <div>
          <label className="text-xs mb-1 block">Children</label>
          <select
            value={children}
            onChange={(e) => setChildren(Number(e.target.value))}
            className="border rounded-xl px-3 py-2 w-full"
          >
            {[0, 1, 2, 3].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        {/* CTA */}
        <button
          onClick={handleCheck}
          className="bg-primaryLite text-white px-6 py-3 rounded-xl hover:opacity-90"
        >
          Check
        </button>
      </div>
    </div>
  );
}
