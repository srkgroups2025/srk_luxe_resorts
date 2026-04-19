"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

function getInitials(name, letters = 2) {
  const trimmed = (name || "").trim();
  if (!trimmed) return "".padEnd(letters, "?");

  const parts = trimmed.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  }

  const cleaned = trimmed.replace(/[^a-zA-Z0-9]/g, "");
  return cleaned.slice(0, letters).toUpperCase();
}

export default function UserAvatar({
  name,
  src,
  alt = "User",
  className = "",
  imgClassName = "",
  fallbackClassName = "",
}) {
  const [imgError, setImgError] = useState(false);
  const initials = useMemo(() => getInitials(name, 2), [name]);
  const showImage = Boolean(src) && !imgError;

  if (showImage) {
    return (
      <div className={`${className} overflow-hidden`}>
        <Image
          src={src}
          alt={alt}
          width={48}
          height={48}
          onError={() => setImgError(true)}
          className={`${imgClassName} h-full w-full`}
        />
      </div>
    );
  }

  return (
    <div
      aria-label={alt}
      title={name || alt}
      className={`${className} ${fallbackClassName} flex select-none items-center justify-center leading-none`}
    >
      {initials}
    </div>
  );
}
