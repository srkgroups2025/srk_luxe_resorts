"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash, FaLock, FaShieldAlt } from "react-icons/fa";
import { useAuth } from "@/hooks/useUser";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();
  const { resetPassword } = useAuth();
  const resetToken = Array.isArray(token) ? token[0] : token;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      return toast.error("Please fill in both password fields");
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setLoading(true);

      await resetPassword.mutateAsync({
        token: resetToken,
        newPassword: password,
        confirmPassword,
      });

      toast.success("Password reset successful", {
        description: "You can now sign in with your new password",
      });

      router.push("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(202,92,48,0.14),_transparent_36%),linear-gradient(135deg,_#f7f3ec_0%,_#f3efe6_48%,_#eef2f5_100%)] px-4 py-10 flex items-center justify-center">
      <motion.div
        className="absolute -top-24 left-[-5rem] h-72 w-72 rounded-full bg-primaryLite/20 blur-3xl"
        animate={{ y: [0, 18, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-5rem] right-[-4rem] h-80 w-80 rounded-full bg-secondaryLite/25 blur-3xl"
        animate={{ y: [0, -16, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/80 bg-white/75 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl"
      >
        <div className="grid md:grid-cols-[1.1fr_0.9fr]">
          <div className="relative hidden md:flex flex-col justify-between gap-8 bg-gradient-to-br from-teritaryLite via-[#173330] to-[#0c1514] p-10 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(226,200,137,0.14),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(202,92,48,0.18),_transparent_35%)]" />
            <div className="relative z-10">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90">
                <FaShieldAlt className="text-secondaryLite" />
                Secure password recovery
              </div>
              <h1 className="max-w-md text-4xl font-semibold leading-tight">
                Create a stronger password and get back into your account.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/75">
                We&apos;ll verify your reset token, let you set a new password,
                and guide you back to sign in with a cleaner recovery flow.
              </p>
            </div>

            <div className="relative z-10 grid gap-3 text-sm text-white/80">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-secondaryLite/20 text-secondaryLite">
                  1
                </span>
                Enter your new password twice
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-secondaryLite/20 text-secondaryLite">
                  2
                </span>
                Use the eye controls to confirm it
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-secondaryLite/20 text-secondaryLite">
                  3
                </span>
                Return to sign in after reset
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 md:p-10">
            <div className="mb-8 flex items-center gap-3 md:hidden">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primaryLite/15 text-primaryLite">
                <FaLock />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                  Account recovery
                </p>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Reset your password
                </h2>
              </div>
            </div>

            <div className="mb-8 hidden md:block">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primaryLite/20 to-secondaryLite/25 text-primaryLite shadow-sm">
                <FaLock className="text-xl" />
              </div>
              <h2 className="text-3xl font-semibold text-gray-900">
                Reset your password
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Choose a new password for your Luxe Resorts account.
              </p>
            </div>

            <form onSubmit={handleReset} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  New password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 pr-14 text-gray-900 outline-none transition focus:border-primaryLite focus:ring-4 focus:ring-primaryLite/15"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-gray-500 transition hover:text-gray-900"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter new password"
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 pr-14 text-gray-900 outline-none transition focus:border-primaryLite focus:ring-4 focus:ring-primaryLite/15"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-gray-500 transition hover:text-gray-900"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                className={`w-full rounded-2xl px-4 py-3.5 text-base font-semibold text-white shadow-lg transition ${
                  loading
                    ? "cursor-not-allowed bg-gray-400"
                    : "bg-gradient-to-r from-primaryLite to-[#b96b3e] hover:brightness-105"
                }`}
                whileHover={!loading ? { scale: 1.01 } : {}}
                whileTap={!loading ? { scale: 0.99 } : {}}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </motion.button>
            </form>

            <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-white/70 p-4 text-sm text-gray-600">
              Make sure both entries match exactly before submitting. You can
              reveal either password using the eye icon.
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
