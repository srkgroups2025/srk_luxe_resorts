"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useUser";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleReset = async () => {
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      await resetPassword.mutateAsync({
        token,
        newPassword: password,
        confirmPassword,
      });

      toast.success("Password reset successful");
      router.push("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired link");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm p-6 bg-white rounded-xl">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Reset Password
        </h2>

        <input
          type="password"
          placeholder="New Password"
          className="w-full mb-3 px-4 py-2 border rounded-xl"
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full mb-3 px-4 py-2 border rounded-xl"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          onClick={handleReset}
          className="w-full bg-primaryLite text-white py-2 rounded-xl"
        >
          Reset Password
        </button>
      </div>
    </div>
  );
}
