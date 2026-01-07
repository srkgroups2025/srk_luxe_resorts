"use client";

import "./globals.css";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BookingProvider } from "./context/BookingContext";

const queryClient = new QueryClient();

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <BookingProvider>
          <QueryClientProvider client={queryClient}>
            {children}
            <Toaster
              position="top-center"
              richColors
              closeButton
            />
          </QueryClientProvider>
        </BookingProvider>
      </body>
    </html>
  );
}
