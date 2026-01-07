"use client";
import { places } from "@/data/places";
import AutoImageSlider from "@/components/AutoImageSlider";

export default function NearbyPlaces() {
  return (
    <section className="py-5 px-4 md:px-8">
      <h3 className="text-3xl font-bold text-center mb-8 md:mb-12">
        Nearby Places to Visit
      </h3>

      {/* Horizontal scroll on mobile */}
      <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-8 overflow-x-auto md:overflow-visible scroll-smooth snap-x snap-mandatory">
        {places.map((place) => (
          <div
            key={place.id}
            className="min-w-[250px] md:min-w-0 snap-start rounded-xl overflow-hidden shadow bg-cards flex-shrink-0 md:flex-shrink-auto md:hover:scale-105 transition-transform"
          >
            <AutoImageSlider images={place.images} alt={place.name} />
            <p className="p-4 text-center font-semibold">{place.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
