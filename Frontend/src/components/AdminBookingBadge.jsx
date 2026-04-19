"use client";

import Link from "next/link";
import { useAdminBookings } from "../hooks/useBook";

function BellIcon() {
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
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.172V11a6 6 0 1 0-12 0v3.172c0 .538-.214 1.055-.595 1.438L4 17h5"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a3 3 0 0 0 6 0" />
    </svg>
  );
}

export default function AdminBookingBadge() {
  const { getAllBookingsAndHoldings } = useAdminBookings({
    enabledUpcoming: true,
    enabledHistory: false,
  });

  const count = getAllBookingsAndHoldings?.data?.count ?? 0;

  return (
    <div className="relative">
      <Link href="/admin-panel/bookings">
        <span className="inline-flex items-center justify-center rounded-[16px] border-[2px] text-secondaryLite border-secondaryLite p-2 transition-transform duration-200 hover:scale-105">
          <BellIcon />
        </span>
      </Link>

      {count > 0 && (
        <span className="absolute -top-1 -right-1 rounded-[16px] bg-red px-[6px] py-[2px] text-[10px] text-secondaryLite">
          {count}
        </span>
      )}
    </div>
  );
}
