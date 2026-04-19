"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import CheckAvailablity from "@/components/CheckAvailablity";
import LazySection from "@/components/LazySection";
import useBG from "@/hooks/useBG";
import { TEXT } from "@/constants/site";

const FALLBACK_BACKGROUND = "/bg_img.jpeg";
const SLIDE_INTERVAL = 4000;

const Amenities = dynamic(() => import("@/components/Amenities"), {
  ssr: false,
});
const NearbyPlaces = dynamic(() => import("@/components/NearbyPlaces"), {
  ssr: false,
});
const Event = dynamic(() => import("@/components/Events"), {
  ssr: false,
});
const Details = dynamic(() => import("@/components/Details"), {
  ssr: false,
});
const Reviews = dynamic(() => import("@/components/Reviews"), {
  ssr: false,
});
const Footer = dynamic(() => import("@/components/Footer"), {
  ssr: false,
});
const WhatsappButton = dynamic(() => import("@/components/WhatsappButton"), {
  ssr: false,
});

function SectionSkeleton({ short = false }) {
  return (
    <div className={`py-10 ${short ? "max-w-4xl mx-auto" : ""}`}>
      <div className="mx-auto h-8 w-56 rounded-full bg-white/10 animate-pulse" />
      <div
        className={`mt-6 grid gap-4 ${
          short ? "grid-cols-1" : "sm:grid-cols-2 md:grid-cols-3"
        }`}
      >
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-56 rounded-2xl bg-white/10 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { getAllBG } = useBG();
  const [backgroundImages, setBackgroundImages] = useState([FALLBACK_BACKGROUND]);
  const [activeBackgroundIndex, setActiveBackgroundIndex] = useState(0);

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

  return (
    <div className="bg-bgColor flex min-h-screen flex-col">
      <Header />

      <section className="relative z-20 h-[90vh] overflow-visible sm:h-screen">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <Image
            src={backgroundImages[activeBackgroundIndex] ?? FALLBACK_BACKGROUND}
            alt=""
            fill
            sizes="100vw"
            priority
            className="object-cover object-center"
          />
        </div>

        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center sm:px-6 md:px-12 lg:px-20">
          <h2 className="max-w-full text-2xl font-bold leading-snug text-primaryLite sm:max-w-xl sm:text-3xl md:max-w-3xl md:text-4xl lg:text-5xl">
            {TEXT.SITE.QUOTES}
          </h2>

          <CheckAvailablity />
        </div>
      </section>

      <section id="amenities" className="px-4 sm:px-6 md:px-12 lg:px-20">
        <LazySection fallback={<SectionSkeleton />}>
          <Amenities />
        </LazySection>
      </section>

      <section className="px-4 sm:px-6 md:px-12 lg:px-20">
        <LazySection fallback={<SectionSkeleton short />}>
          <Details />
        </LazySection>
      </section>

      <section id="nearby-places" className="px-4 sm:px-6 md:px-12 lg:px-20">
        <LazySection fallback={<SectionSkeleton />}>
          <NearbyPlaces />
        </LazySection>
      </section>

      <section className="px-4 sm:px-6 md:px-12 lg:px-20">
        <LazySection fallback={<SectionSkeleton />}>
          <Event />
        </LazySection>
      </section>

      <section className="px-4 sm:px-6 md:px-12 lg:px-20">
        <LazySection fallback={<SectionSkeleton />}>
          <Reviews />
        </LazySection>
      </section>

      <LazySection fallback={<div className="h-24" />}>
        <Footer />
      </LazySection>

      <WhatsappButton />
    </div>
  );
}
