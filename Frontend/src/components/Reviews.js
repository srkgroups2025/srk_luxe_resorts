"use client";

import { useState } from "react";
import useReview from "../hooks/useReview";

/* -------------------- Star Rating Component -------------------- */
function StarRating({ rating, size = "w-4 h-4" }) {
  const getStarColor = () => {
    if (rating === 5) return "#22C55E";
    if (rating === 4) return "#F97316";
    if (rating === 3) return "#EAB308";
    return "#EF4444";
  };

  const activeColor = getStarColor();

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill={star <= rating ? activeColor : "#E5E7EB"}
          className={size}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.173c.969 0 1.371 1.24.588 1.81l-3.376 2.455a1 1 0 00-.364 1.118l1.287 3.97c.3.921-.755 1.688-1.538 1.118l-3.377-2.455a1 1 0 00-1.175 0l-3.376 2.455c-.783.57-1.838-.197-1.539-1.118l1.287-3.97a1 1 0 00-.364-1.118L2.05 9.397c-.783-.57-.38-1.81.588-1.81h4.173a1 1 0 00.95-.69l1.286-3.97z" />
        </svg>
      ))}
    </div>
  );
}

/* -------------------- Reviews Component -------------------- */
export default function Reviews() {
  const { getReview } = useReview();
  const reviews = getReview?.data?.reviews || [];

  const [selectedReview, setSelectedReview] = useState(null);

  if (!reviews.length) {
    return (
      <p className="mt-4 text-center text-gray-500">
        No reviews yet.
      </p>
    );
  }

  return (
    <>
      <section className="py-8 px-4 bg-gray-100">
        <h3 className="text-3xl font-bold text-center mb-10">
          Customer Reviews <span className="text-primary">({getReview?.data?.totalReviews})</span>
        </h3>

        {/* Horizontal scroll container */}
        <div className="flex flex-nowrap gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
          {reviews.map((r) => (
            <div
              key={r._id}
              onClick={() => setSelectedReview(r)}
              className="w-72 h-44 flex-shrink-0 p-4 cursor-pointer
                 rounded-xl shadow bg-cards snap-start
                 transition-transform hover:scale-105"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-gray-800 truncate">
                  {r.name}
                </p>
                <StarRating rating={r.rating} />
              </div>
              <p className="text-xs mb-1 text-gray-500 truncate">
                {r.email}
              </p>

              <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
                {r.comment}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* -------------------- Popup Modal -------------------- */}
      {selectedReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setSelectedReview(null)}
        >
          <div
            className="bg-white max-w-md w-full rounded-xl p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedReview(null)}
              className="absolute cursor-pointer  top-3 right-3 text-gray-500 hover:text-red hover:font-extrabold"
            >
              ✕
            </button>

            <h4 className="text-xl font-semibold mb-2">
              {selectedReview.name}
            </h4>

            <StarRating
              rating={selectedReview.rating}
              size="w-5 h-5"
            />

            <p className="mt-4 text-gray-700 leading-relaxed">
              {selectedReview.comment}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
