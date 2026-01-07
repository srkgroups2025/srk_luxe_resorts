
"use client";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Amenities from "@/components/Amenities";
import NearbyPlaces from "@/components/NearbyPlaces";
import Event from "@/components/Events";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import CheckAvailablity from "@/components/CheckAvailablity";
import Details from "@/components/Details";
import WhatsappButton from "@/components/WhatsappButton";
import Loader from "@/components/Loader";

export default function Home() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof document !== "undefined" && document.readyState === "complete") {
      setLoading(false);
      return;
    }
    const onLoad = () => setLoading(false);
    if (typeof window !== "undefined") window.addEventListener("load", onLoad);
    return () => {
      if (typeof window !== "undefined") window.removeEventListener("load", onLoad);
    };
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="bg-bgColor min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative h-[90vh] sm:h-screen bg-[url('/bg_img.jpeg')] bg-cover bg-center">
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4 sm:px-6 md:px-12 lg:px-20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primaryLite max-w-full sm:max-w-xl md:max-w-3xl leading-snug">
            A luxurious escape for peaceful stays and grand celebrations, crafted to create timeless memories
          </h2>

          <CheckAvailablity />
        </div>
      </section>

      {/* Amenities Section */}
      <section id="amenities" className="px-4 sm:px-6 md:px-12 lg:px-20">
        <Amenities />
      </section>

      {/* Details Section */}
      <section className="px-4 sm:px-6 md:px-12 lg:px-20">
        <Details />
      </section>

      {/* Nearby Places Section */}
      <section id="nearby-places" className="px-4 sm:px-6 md:px-12 lg:px-20">
        <NearbyPlaces />
      </section>

      {/* Events Section */}
      <section className="px-4 sm:px-6 md:px-12 lg:px-20">
        <Event />
      </section>

      {/* Footer */}
      <Footer />

      {/* WhatsApp Button */}
      <WhatsappButton />
    </div>
  );
}