import { amenities } from "@/data/amenities";
import AutoImageSlider from "@/components/AutoImageSlider";

export default function Amenities() {
  return (
    <section className="py-5 px-4 md:px-8 ">
      <h3 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12">
        Our Awesome Amenities
      </h3>

      {/* Horizontal scroll on mobile, grid on larger screens */}
      <div className="flex md:grid rounded-xl md:grid-cols-4 gap-6 overflow-x-auto no-scrollbar px-2 md:px-0">
        {amenities.map((item) => (
          <div
            key={item.id}
            className=" min-w-[250px] md:min-w-0 rounded-xl bg-cards overflow-hidden shadow-md flex-shrink-0 md:flex-shrink md:hover:scale-105 transition-transform"
          >
            <AutoImageSlider images={item.images} alt={item.title} />
            <p className="p-4 text-center font-semibold">{item.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
