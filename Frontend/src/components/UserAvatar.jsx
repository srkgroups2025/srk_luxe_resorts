"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

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
  motionProps = {},
}) {
  const [imgError, setImgError] = useState(false);
  const initials = useMemo(() => getInitials(name, 2), [name]);
  const showImage = Boolean(src) && !imgError;

  if (showImage) {
    return (
      <motion.img
        {...motionProps}
        src={src}
        alt={alt}
        onError={() => setImgError(true)}
        className={`${className} ${imgClassName}`}
      />
    );
  }

  return (
    <motion.div
      {...motionProps}
      aria-label={alt}
      title={name || alt}
      className={`${className} ${fallbackClassName} flex items-center justify-center select-none leading-none`}
    >
      {initials}
    </motion.div>
  );
}
