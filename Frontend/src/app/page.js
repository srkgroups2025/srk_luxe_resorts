
"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Header from "@/components/Header";
import Amenities from "@/components/Amenities";
import NearbyPlaces from "@/components/NearbyPlaces";
import Event from "@/components/Events";
import Footer from "@/components/Footer";
import CheckAvailablity from "@/components/CheckAvailablity";
import Details from "@/components/Details";
import WhatsappButton from "@/components/WhatsappButton";
import Loader from "@/components/Loader";
import Reviews from "@/components/Reviews";
import useBG from "@/hooks/useBG";

const FALLBACK_BACKGROUND = "/bg_img.jpeg";
const SLIDE_INTERVAL = 4000;

export default function Home() {
  const { getAllBG } = useBG();

  const [loading, setLoading] = useState(true);
  const [backgroundImages, setBackgroundImages] = useState([FALLBACK_BACKGROUND]);
  const [activeBackgroundIndex, setActiveBackgroundIndex] = useState(0);

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

  useEffect(() => {
    const images =
      getAllBG.data?.flatMap((bgItem) =>
        (bgItem?.images ?? []).filter(
          (imageUrl) => typeof imageUrl === "string" && imageUrl.trim().length > 0
        )
      ) ?? [];

    setBackgroundImages(images.length > 0 ? images : [FALLBACK_BACKGROUND]);
    setActiveBackgroundIndex(0);
  }, [getAllBG.data]);

  useEffect(() => {
    if (backgroundImages.length <= 1) return;

    const intervalId = window.setInterval(() => {
      setActiveBackgroundIndex((currentIndex) => (currentIndex + 1) % backgroundImages.length);
    }, SLIDE_INTERVAL);

    return () => window.clearInterval(intervalId);
  }, [backgroundImages]);

  if (loading) return <Loader />;

  return (
    <div className="bg-bgColor min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative h-[90vh] overflow-hidden sm:h-screen">
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={backgroundImages[activeBackgroundIndex] ?? FALLBACK_BACKGROUND}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.03 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
            aria-hidden="true"
            style={{
              backgroundImage: `url(${backgroundImages[activeBackgroundIndex] ?? FALLBACK_BACKGROUND})`,
            }}
          />
        </AnimatePresence>

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

      {/* Reviews Section */}
      <section className="px-4 sm:px-6 md:px-12 lg:px-20">
        <Reviews />
      </section>

      {/* Footer */}
      <Footer />

      {/* WhatsApp Button */}
      <WhatsappButton />
    </div>
  );
}
