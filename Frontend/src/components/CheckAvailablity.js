"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useBooking } from "@/app/context/BookingContext";

const DateRangeDropdown = dynamic(() => import("./DateRangePicker"), {
  ssr: false,
});

function CalendarIcon() {
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
        d="M7 3v3m10-3v3M4.5 9.5h15M5.5 6h13A1.5 1.5 0 0 1 20 7.5v11A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6Z"
      />
    </svg>
  );
}

export default function CheckAvailability() {
  const router = useRouter();
  const { setBookingData } = useBooking();

  const [range, setRange] = useState({ from: undefined, to: undefined });
  const [openCalendar, setOpenCalendar] = useState(false);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  const setNoonTime = (date) => {
    const d = new Date(date);
    d.setHours(12, 0, 0, 0);
    return d;
  };

  const formatUI = (date) => date.toLocaleDateString("en-GB");

  const handleCheck = () => {
    if (isChecking) return;

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

    setIsChecking(true);
    setBookingData({
      checkIn: checkInDate.toISOString(),
      checkOut: checkOutDate.toISOString(),
      adults,
      children,
    });

    window.setTimeout(() => {
      router.push("/book");
    }, 0);
  };

  return (
    <div className="relative z-30 mt-8 w-full max-w-6xl overflow-visible rounded-3xl border border-white/20 bg-white/95 p-4 shadow-2xl backdrop-blur sm:p-6">
      <div className="grid items-end gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:gap-6">
        <div className="relative z-40">
          <label className="mb-1 block text-sm text-grayDark">
            Check-in / Check-out (12 PM - 12 PM)
          </label>

          <button
            type="button"
            onClick={() => setOpenCalendar(true)}
            aria-haspopup="dialog"
            aria-expanded={openCalendar}
            aria-controls="availability-date-range-dialog"
            tabIndex={openCalendar ? -1 : 0}
            aria-hidden={openCalendar}
            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-transform duration-200 hover:scale-[1.01] ${
              openCalendar ? "pointer-events-none opacity-0" : "cursor-pointer"
            }`}
          >
            <span className="min-w-0 flex-1">
              {range?.from && range?.to ? (
                <div>
                  {formatUI(range.from)} - {formatUI(range.to)}
                </div>
              ) : (
                <span className="text-gray-400">Select dates</span>
              )}
            </span>
            <span className="shrink-0">
              <CalendarIcon />
            </span>
          </button>

          {openCalendar && (
            <DateRangeDropdown
              open={openCalendar}
              onClose={() => setOpenCalendar(false)}
              range={range}
              setRange={setRange}
              onApply={() => {}}
            />
          )}
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
            Adults
          </label>
          <select
            value={adults}
            onChange={(e) => setAdults(Number(e.target.value))}
            className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-gray-300 focus:ring-2 focus:ring-black/5"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
            Children
          </label>
          <select
            value={children}
            onChange={(e) => setChildren(Number(e.target.value))}
            className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-gray-300 focus:ring-2 focus:ring-black/5"
          >
            {[0, 1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleCheck}
          disabled={isChecking}
          className={`rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-all ${
            isChecking
              ? "cursor-not-allowed bg-primaryLite/70"
              : "cursor-pointer bg-primaryLite hover:translate-y-[-1px] hover:opacity-95"
          }`}
        >
          {isChecking ? "Checking..." : "Check Availablity"}
        </button>
      </div>
    </div>
  );
}
