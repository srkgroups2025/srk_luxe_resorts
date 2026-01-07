"use client";
import { createContext, useContext, useState } from "react";

const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  const [bookingData, setBookingData] = useState({
    checkIn: "",
    checkOut: "",
    adults: 1,
    children: 0,
  });

  return (
    <BookingContext.Provider value={{ bookingData, setBookingData }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used inside BookingProvider");
  }
  return context;
};
