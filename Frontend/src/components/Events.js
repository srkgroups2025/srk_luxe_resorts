"use client";
import { events } from "@/data/events";
import AutoImageSlider from "@/components/AutoImageSlider";

export default function Events() {
  return (
    <section className="py-5 px-4 bg-gray-100">
      <h3 className="text-3xl font-bold text-center mb-8 md:mb-12">
        Events & Celebrations
      </h3>

      {/* Mobile: horizontal scroll, Desktop: grid */}
      <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory md:snap-none">

        {events.map(event => (
          <div
            key={event.id}
            className="flex-shrink-0 md:flex-shrink-1 w-72 md:w-auto rounded-xl overflow-hidden shadow bg-cards snap-start md:hover:scale-105 transition-transform"
          >
            <AutoImageSlider images={event.images} alt={event.name} />
            <p className="p-4 text-center font-semibold">{event.name}</p>
          </div>
        ))}

      </div>
    </section>
  );
}
