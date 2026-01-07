"use client";
import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function DateRangeDropdown({
  open,
  onClose,
  range,
  setRange,
}) {
  const ref = useRef(null);

  const [numMonths, setNumMonths] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  useEffect(() => {
    const updateMonths = () => {
      setNumMonths(window.innerWidth >= 768 ? 2 : 1);
    };
    updateMonths();
    window.addEventListener("resize", updateMonths);
    const t = setTimeout(() => setLoading(false), 150);
    return () => {
      window.removeEventListener("resize", updateMonths);
      clearTimeout(t);
    };
  }, []);

  if (!open) return null;

  // Compute minDate dynamically based on 12 PM rule
  const now = new Date();
  const noonToday = new Date();
  noonToday.setHours(12, 0, 0, 0); // 12 PM today

  // If current time >= 12 PM, disable today
  const minDate = now >= noonToday ? new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) : now;

  return (
    <div
      ref={ref}
      className="absolute z-50 mt-2 bg-white rounded-2xl shadow p-4 left-1/2 transform -translate-x-1/2 w-[90vw] max-w-md md:max-w-3xl max-h-[80vh] overflow-auto"
    >
      {numMonths > 1 && (
        <style>{`.rdp-months{display:flex;gap:1rem;justify-content:center;align-items:flex-start}`}</style>
      )}
      {loading ? (
        <div className="flex items-center justify-center p-4">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
        </div>
      ) : (
        <DayPicker
          mode="range"
          selected={range || { from: undefined, to: undefined }}
          onSelect={(r) => {
            if (!r) {
              setRange({ from: undefined, to: undefined });
            } else if (r.from && r.to && r.from.getTime() === r.to.getTime()) {
              setRange({ from: r.from, to: undefined }); // prevent same-day double-click
            } else {
              setRange(r);
            }
          }}
          disabled={{ before: minDate }}
          numberOfMonths={numMonths}
        />
      )}
    </div>
  );
}
