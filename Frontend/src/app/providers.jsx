"use client";

import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BookingProvider } from "./context/BookingContext";

const queryClient = new QueryClient();

export default function Providers({ children }) {
  return (
    <BookingProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-center" richColors closeButton />
      </QueryClientProvider>
    </BookingProvider>
  );
}
