"use client";
import Image from "next/image";

export default function Loader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0E1B1A]">
      <div className="flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="relative">
          <Image
            src="/srk-logo.jpeg"
            alt="SRK Luxe Resorts"
            width={120}
            height={120}
            priority
            className="rounded-full object-cover border-2 border-primaryLite shadow-lg animate-fadeIn"
          />

          {/* Glow Ring */}
          <span className="absolute inset-0 rounded-full border border-primaryLite/40 animate-ping"></span>
        </div>
      </div>
    </div>
  );
}