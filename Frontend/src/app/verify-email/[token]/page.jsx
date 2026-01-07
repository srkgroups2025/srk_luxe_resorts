"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";

export default function VerifyEmailPage() {
  const { token } = useParams();
  const router = useRouter();

  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!token) return;

    const verifyEmail = async () => {
      try {
        await axiosInstance.get(`/api/auth/verify-email/${token}`);

        setStatus("success");

        // ✅ Redirect to home after 2 seconds
        setTimeout(() => {
          router.replace("/");
        }, 2000);
      } catch (error) {
        console.error(
          "Email verification error:",
          error.response?.data || error
        );
        setStatus("error");
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "1rem",
        textAlign: "center",
        padding: "1rem",
      }}
    >
      {status === "loading" && <h2>Verifying your email...</h2>}

      {status === "success" && (
        <>
          <h2 style={{ color: "green" }}>✅ Email verified successfully</h2>
          <p>Redirecting to home...</p>
        </>
      )}

      {status === "error" && (
        <h2 style={{ color: "red" }}>
          ❌ Verification link is invalid or expired
        </h2>
      )}
    </div>
  );
}
