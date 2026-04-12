"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function DateRangeDropdown({
  open,
  onClose,
  range,
  setRange,
  minDate: minDateProp,
  onApply,
  layoutId = "check-availability-date-range",
}) {
  const panelRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(media.matches);

    update();

    if (media.addEventListener) {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }

    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    window.setTimeout(() => {
      panelRef.current?.focus?.();
    }, 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const now = new Date();
  const noonToday = new Date();
  noonToday.setHours(12, 0, 0, 0);

  const minDate =
    minDateProp ||
    (now >= noonToday
      ? new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      : now);

  const numMonths = isMobile ? 1 : 2;

  const handleSelect = (nextRange) => {
    if (!nextRange) {
      setRange({ from: undefined, to: undefined });
      return;
    }

    if (
      nextRange.from &&
      nextRange.to &&
      nextRange.from.getTime() === nextRange.to.getTime()
    ) {
      setRange({ from: nextRange.from, to: undefined });
      return;
    }

    setRange(nextRange);
  };

  const handleApply = () => {
    if (typeof onApply === "function") {
      onApply();
    }

    onClose();
  };

  return (
    <AnimatePresence>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={onClose}
        >
          <motion.div
            layoutId={layoutId}
            id="availability-date-range-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="availability-date-range-title"
            aria-describedby="availability-date-range-description"
            tabIndex={-1}
            ref={panelRef}
            onMouseDown={(event) => event.stopPropagation()}
            initial={{ opacity: 0, scale: 0.7, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: -20 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="date-range-picker-panel pl-5 relative w-[min(100%,42rem)] overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5"
          >
            <style>{`
          .calendar-popup-panel {
            animation: calendarPop 160ms ease-out;
          }

          @keyframes calendarPop {
            from {
              opacity: 0;
              transform: translateY(10px) scale(0.98);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          .calendar-popup-panel .rdp {
                margin: 0;
            width: fit-content;
            --rdp-cell-size: 2.35rem;
            --rdp-accent-color: #4b5563;
            --rdp-background-color: rgba(75, 85, 99, 0.08);
            --rdp-outline: 2px solid rgba(75, 85, 99, 0.35);
            --rdp-outline-selected: 2px solid rgba(75, 85, 99, 0.5);
              }

          .calendar-popup-panel .rdp-months {
                display: flex;
                align-items: flex-start;
                justify-content: center;
            gap: 0.5rem;
                flex-wrap: nowrap;
            padding: 0.75rem;
            width: fit-content;
              }

          .calendar-popup-panel .rdp-month {
                margin: 0;
              }

          .calendar-popup-panel .rdp-caption {
            padding-bottom: 0.5rem;
              }

          .calendar-popup-panel .rdp-caption_label {
                font-weight: 600;
                letter-spacing: -0.01em;
              }

          .calendar-popup-panel .rdp-nav {
                gap: 0.25rem;
              }

          .calendar-popup-panel .rdp-table {
            width: 100%;
            max-width: 100%;
          }

          .calendar-popup-panel .rdp-day {
            transition: background-color 160ms ease, color 160ms ease, box-shadow 160ms ease;
              }

          .calendar-popup-panel .rdp-day_outside {
            opacity: 0.45;
                color: #9ca3af;
              }

              @media (max-width: 767px) {
            .calendar-popup-panel .rdp-months {
              padding: 0.5rem;
                }
              }
            `}</style>

            <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-4 py-4 sm:px-5">
              <div>
                <p
                  id="availability-date-range-title"
                  className="text-sm font-semibold text-gray-900"
                >
                  Select dates
                </p>
                <p
                  id="availability-date-range-description"
                  className="mt-1 text-xs text-gray-500"
                >
                  Check-in and check-out are both set at 12:00 PM.
                </p>
              </div>

              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900"
                aria-label="Close date picker"
              >
                ×
              </motion.button>
            </div>

            <div className="max-h-[calc(100vh-10rem)] overflow-auto sm:max-h-[calc(100vh-12rem)]">
              <DayPicker
                mode="range"
                selected={range || { from: undefined, to: undefined }}
                onSelect={handleSelect}
                disabled={{ before: minDate }}
                numberOfMonths={numMonths}
                showOutsideDays={false}
              />
            </div>

            {typeof onApply === "function" ? (
              <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-4 py-4 sm:px-5">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleApply}
                  className="rounded-xl bg-primaryLite px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/10 transition hover:opacity-95"
                >
                  Apply dates
                </button>
              </div>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
