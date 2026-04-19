"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function AutoImageSlider({
  images,
  alt,
  sizes = "(max-width: 768px) 250px, 33vw",
  quality = 72,
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;

    const interval = window.setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => window.clearInterval(interval);
  }, [images]);

  const currentImage = images?.[current];

  return (
    <div className="relative h-56 w-full overflow-hidden">
      {currentImage ? (
        <Image
          src={currentImage}
          alt={alt}
          fill
          sizes={sizes}
          quality={quality}
          className="object-cover transition-opacity duration-500"
        />
      ) : null}
    </div>
  );
}
