"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useReview from "../../hooks/useReview";

export default function ReviewPage() {
  const { createReview } = useReview();
  const searchParams = useSearchParams();
  const emailFromLink = searchParams.get("email") || "";
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState(emailFromLink);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [success, setSuccess] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address");
      return;
    }

    createReview.mutate(
      { name, email, rating, comment },
      {
        onSuccess: () => {
          setSuccess(true);
          setName("");
          setEmail("");
          setRating(5);
          setComment("");
        },
      }
    );
  };

  // Redirect to home after 3 seconds if review was successful
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push("/"); // Redirect to homepage
      }, 3000); // 3000ms = 3 seconds

      return () => clearTimeout(timer); // Cleanup if unmounted
    }
  }, [success, router]);

  if (success) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-green-500">
          Thank you for your review!
        </h1>
        <p className="mt-2 text-gray-500">Redirecting to homepage...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">Submit Your Review</h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-full max-w-md"
      >
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="border p-2 rounded"
        >
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} -{" "}
              {r === 5
                ? "Excellent"
                : r === 4
                  ? "Very Good"
                  : r === 3
                    ? "Good"
                    : r === 2
                      ? "Poor"
                      : "Terrible"}
            </option>
          ))}
        </select>
        <textarea
          placeholder="Your Comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Submit Review
        </button>
      </form>
    </div>
  );
}
