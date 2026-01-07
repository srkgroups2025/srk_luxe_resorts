import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ApiRoutes } from "@/utils/ApiRoutes";
import axiosInstance from "@/utils/axiosInstance";
import { emitAuthChange } from "@/utils/authEvents";

// Mobile OTP related hooks
export function useVerifyMobileNumber() {
  const sendMobileOtp = useMutation({
    mutationFn: async ({ mobileNumber }) => {
      const res = await axiosInstance.post(ApiRoutes.auth.sendOtp.path, { mobileNumber });
      return res.data;
    },
  });

  const verifyOtp = useMutation({
    mutationFn: async ({ mobileNumber, otp }) => {
      const res = await axiosInstance.post(ApiRoutes.auth.verifyMobile.path, { mobileNumber, otp });
      return res.data;
    },
  });

  return { sendMobileOtp, verifyOtp };
}

// Auth related hooks
export function useAuth() {
  const queryClient = useQueryClient();

  const signup = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosInstance({
        url: ApiRoutes.auth.signup.path,
        method: ApiRoutes.auth.signup.method,
        data: payload,
      });
      return res.data;
    },
  });

  const login = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosInstance({
        url: ApiRoutes.auth.login.path,
        method: ApiRoutes.auth.login.method,
        data: payload,
      });
      return res.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("userInfo", JSON.stringify(data.user));
      emitAuthChange();
    },
  });

  /* ---------------- FORGOT PASSWORD (EMAIL) ---------------- */
  const forgotPassword = useMutation({
    mutationFn: async ({ email }) => {
      const res = await axiosInstance.post(
        ApiRoutes.auth.forgotPassword.path,
        { email }
      );
      return res.data;
    },
  });

  /* ---------------- RESET PASSWORD (TOKEN) ---------------- */
  const resetPassword = useMutation({
    mutationFn: async ({ token, newPassword, confirmPassword }) => {
      if (!token) throw new Error("Reset token missing");

      const route = ApiRoutes.auth.resetPassword(token);

      const res = await axiosInstance({
        url: route.path,
        method: route.method,
        data: { newPassword, confirmPassword },
      });

      return res.data;
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("accessToken");
      await axiosInstance({
        url: ApiRoutes.auth.logout.path,
        method: ApiRoutes.auth.logout.method,
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      localStorage.removeItem("userInfo");
      queryClient.removeQueries(["userProfile"]);
      emitAuthChange();
    },
  });

  return { signup, login, forgotPassword, resetPassword, logout };
}

// User profile hook
export function useProfile() {
  const queryClient = useQueryClient();

  /* ---------------- GET PROFILE ---------------- */
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        ApiRoutes.user.getProfile.path,
        {
        }
      );
      return res.data.user;
    },
    enabled: typeof window !== "undefined",
  });

  /* ---------------- UPDATE PROFILE ---------------- */
  const updateUser = useMutation({
    mutationFn: async (updatedData) => {
      const res = await axiosInstance.put(
        ApiRoutes.user.updateProfile.path,
        updatedData,
        {
        }
      );
      return res.data.user;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["userProfile"], data);
      localStorage.setItem("userInfo", JSON.stringify(data)); // optional cache
    },
  });

  return { user, isLoading, isError, updateUser };
}
