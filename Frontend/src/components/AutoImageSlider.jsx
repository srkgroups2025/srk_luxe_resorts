"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AutoImageSlider({ images, alt }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000); 

    return () => clearInterval(interval);
  }, [images]);

  return (
    <div className="relative h-56 w-full overflow-hidden">
      <AnimatePresence>
        <motion.img
          key={current}
          src={images[current]}
          alt={alt}
          className="absolute h-56 w-full object-cover"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      </AnimatePresence>
    </div>
  );
}
