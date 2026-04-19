"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useUser";
import { toast } from "sonner";

const MSG91_SCRIPT_SRC = "https://verify.msg91.com/otp-provider.js";

export default function LoginModal({ close }) {
  const { signup, login, forgotPassword } = useAuth();
  const msg91ScriptPromiseRef = useRef(null);

  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [mobileNumberVerified, setMobileNumberVerified] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const existingScript = document.querySelector(
      `script[src="${MSG91_SCRIPT_SRC}"]`
    );

    if (typeof window.initSendOTP === "function") {
      msg91ScriptPromiseRef.current = Promise.resolve();
      return;
    }

    if (existingScript) {
      msg91ScriptPromiseRef.current = new Promise((resolve, reject) => {
        const startedAt = Date.now();
        const timer = window.setInterval(() => {
          if (typeof window.initSendOTP === "function") {
            window.clearInterval(timer);
            resolve();
            return;
          }

          if (Date.now() - startedAt > 10000) {
            window.clearInterval(timer);
            reject(new Error("MSG91 OTP widget script timed out"));
          }
        }, 50);
      });
      return;
    }

    msg91ScriptPromiseRef.current = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = MSG91_SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error("Failed to load MSG91 OTP widget script"));
      document.body.appendChild(script);
    });
  }, []);

  const getMsg91Config = (formattedMobileNumber) => {
    const widgetId = process.env.NEXT_PUBLIC_MSG91_WIDGET_ID;
    const authToken = process.env.NEXT_PUBLIC_MSG91_WIDGET_TOKEN;

    if (!widgetId || !authToken) {
      throw new Error(
        "MSG91 widget is not configured. Set NEXT_PUBLIC_MSG91_WIDGET_ID and NEXT_PUBLIC_MSG91_WIDGET_TOKEN."
      );
    }

    return {
      widgetId,
      // MSG91 expects the raw widget token string here, not an object wrapper.
      tokenAuth: authToken,
      identifier: formattedMobileNumber,
      success: () => {
        setMobileNumberVerified(true);
        toast.success("Mobile number verified", {
          description: "MSG91 verification completed successfully",
        });
      },
      failure: () => {
        setMobileNumberVerified(false);
        toast.error("OTP verification failed", {
          description: "Please try again",
        });
      },
    };
  };

  const handleMobileVerify = async () => {
    const digitsOnly = form.mobileNumber.trim().replace(/\D/g, "");
    const normalizedMobileNumber = digitsOnly.startsWith("91")
      ? digitsOnly.slice(2)
      : digitsOnly;

    if (!normalizedMobileNumber.match(/^[6-9]\d{9}$/)) {
      return toast.error("Invalid mobile number", {
        description: "Please enter a valid Indian mobile number",
      });
    }

    try {
      const formattedMobileNumber = `91${normalizedMobileNumber}`;

      if (!msg91ScriptPromiseRef.current) {
        throw new Error("MSG91 widget script is still loading");
      }

      await msg91ScriptPromiseRef.current;

      if (
        typeof window === "undefined" ||
        typeof window.initSendOTP !== "function"
      ) {
        throw new Error("MSG91 widget is not ready");
      }

      window.initSendOTP(getMsg91Config(formattedMobileNumber));
    } catch (err) {
      toast.error("Failed to launch verification", {
        description: err?.message || "Please try again",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "mobileNumber" && mobileNumberVerified) {
      setMobileNumberVerified(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (mode === "signup") {
        if (!mobileNumberVerified) {
          return toast.warning("Mobile number not verified");
        }

        if (form.password !== form.confirmPassword) {
          return toast.error("Passwords do not match");
        }

        await signup.mutateAsync({
          name: form.name,
          email: form.email,
          mobileNumber: form.mobileNumber,
          password: form.password,
          isMobileNumberVerified: mobileNumberVerified,
        });

        toast.success("Signup successful", {
          description: "Please verify your email to continue",
        });

        setMode("login");
        return;
      }

      if (mode === "login") {
        if (!form.email || !form.password) {
          return toast.error("Missing credentials");
        }

        await login.mutateAsync({
          email: form.email,
          password: form.password,
        });

        toast.success("Welcome back!", {
          description: "Login successful",
        });

        close();
      }

      if (mode === "reset") {
        if (!form.email) {
          return toast.error("Please enter your email");
        }

        await forgotPassword.mutateAsync({ email: form.email });

        toast.success("Password reset email sent", {
          description: "Please check your email",
        });

        setMode("login");
      }
    } catch (err) {
      const errors = err.response?.data?.errors;
      const message = err.response?.data?.message;

      if (errors && Array.isArray(errors)) {
        // Remove duplicate errors
        const uniqueErrors = [...new Set(errors)];

        uniqueErrors.forEach((error) => {
          toast.error(error);
        });
      } else {
        toast.error(message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/40 flex justify-center items-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      onClick={close}
    >
      <motion.div
        className="bg-gradient-to-br from-white via-slate-50 to-gray-50 w-full max-w-md p-8 rounded-3xl relative shadow-2xl border border-white/80 backdrop-blur-sm"
        initial={{ scale: 0.8, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 40 }}
        transition={{
          duration: 0.4,
          ease: "easeOut",
          type: "spring",
          stiffness: 100,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.button
          type="button"
          onClick={close}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-red-50 text-red-600 hover:bg-red-200 shadow-lg"
          whileHover={{ scale: 1.15, rotate: 90 }}
          whileTap={{ scale: 0.85 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
        >
          <span className="text-xl">X</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <motion.h2
            className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent text-center"
            key={mode}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            {mode === "login" && "Welcome Back"}
            {mode === "signup" && "Join Us"}
            {mode === "reset" && "Reset Access"}
          </motion.h2>
          <motion.p
            className="text-center text-gray-500 text-sm mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {mode === "login" && "Sign in to your account"}
            {mode === "signup" && "Create your account to get started"}
            {mode === "reset" && "We'll help you recover your account"}
          </motion.p>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            {mode === "signup" && (
              <motion.div
                className="mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <input
                  name="name"
                  placeholder="Full Name"
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all duration-300 placeholder-gray-400 text-gray-800 font-medium"
                />
              </motion.div>
            )}

            <motion.div
              className="mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all duration-300 placeholder-gray-400 text-gray-800 font-medium"
              />
            </motion.div>

            {mode === "signup" && (
              <motion.div
                className="mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="relative">
                  <input
                    name="mobileNumber"
                    type="tel"
                    inputMode="numeric"
                    placeholder="Mobile Number"
                    value={form.mobileNumber}
                    onChange={handleChange}
                    disabled={mobileNumberVerified}
                    className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all duration-300 placeholder-gray-400 text-gray-800 font-medium disabled:opacity-60"
                  />

                  {!mobileNumberVerified && (
                    <motion.button
                      type="button"
                      onClick={handleMobileVerify}
                      className="absolute right-2 top-1/2 cursor-pointer -translate-y-1/2 text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 px-3 py-1.5 rounded-lg shadow-md"
                      whileHover={{
                        scale: 1.08,
                        boxShadow: "0 8px 16px rgba(99,102,241,0.3)",
                      }}
                      whileTap={{ scale: 0.92 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      Verify
                    </motion.button>
                  )}

                  {mobileNumberVerified && (
                    <motion.span
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1.5 rounded-lg text-xs font-bold shadow-md flex items-center gap-1"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    >
                      Verified
                    </motion.span>
                  )}
                </div>
              </motion.div>
            )}

            {(mode === "login" || mode === "signup") && (
              <motion.div
                className="mb-4 relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: mode === "signup" ? 0.25 : 0.15 }}
              >
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all duration-300 placeholder-gray-400 text-gray-800 font-medium"
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold cursor-pointer text-gray-500 hover:text-gray-800"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {showPassword ? "Hide" : "Show"}
                </motion.button>
              </motion.div>
            )}

            {mode === "signup" && (
              <motion.div
                className="mb-4 relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all duration-300 placeholder-gray-400 text-gray-800 font-medium"
                />
                <motion.button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold cursor-pointer text-gray-500 hover:text-gray-800"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </motion.button>
              </motion.div>
            )}

            {mode === "login" && (
              <motion.div
                className="flex justify-end mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.button
                  type="button"
                  onClick={() => setMode("reset")}
                  className="text-sm font-semibold cursor-pointer bg-gradient-to-r from-slate-100 to-slate-50 text-indigo-600 hover:text-indigo-700 hover:from-slate-200 hover:to-slate-100 px-4 py-2 rounded-lg transition-all duration-300 shadow-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Forgot Password?
                </motion.button>
              </motion.div>
            )}

            <motion.button
              disabled={loading}
              onClick={handleSubmit}
              className={`w-full font-bold py-3.5 cursor-pointer rounded-xl mb-6 transition-all duration-300 shadow-lg text-white text-lg ${loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 shadow-xl"
                }`}
              whileHover={() => (!loading ? { scale: 1.02 } : {})}
              whileTap={() => (!loading ? { scale: 0.98 } : {})}
              transition={{ duration: 0.2, type: "spring", stiffness: 200 }}
            >
              {loading ? (
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  Processing...
                </motion.span>
              ) : mode === "login" ? (
                "Sign In"
              ) : mode === "signup" ? (
                "Create Account"
              ) : (
                "Send Reset Link"
              )}
            </motion.button>

            {(mode === "login" || mode === "signup") && (
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-gray-600 text-sm">
                  {mode === "login"
                    ? "Don't have an account? "
                    : "Already have an account? "}
                  <motion.button
                    type="button"
                    onClick={() => setMode(mode === "login" ? "signup" : "login")}
                    className="font-bold bg-gradient-to-r cursor-pointer from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {mode === "login" ? "Sign Up" : "Sign In"}
                  </motion.button>
                </p>
              </motion.div>
            )}

            {mode === "reset" && (
              <motion.button
                type="button"
                onClick={() => setMode("login")}
                className="w-full text-center cursor-pointer text-sm font-semibold text-indigo-600 hover:text-indigo-700 py-3 mt-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg transition-all duration-300 hover:from-indigo-100 hover:to-purple-100"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Back to Login
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
