import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { ApiRoutes } from "@/utils/ApiRoutes";
import { toast } from "sonner";

export const useCreateAndHoldBooking = () => {
  const queryClient = useQueryClient();

  const createBooking = useMutation({
    mutationFn: async (bookingData) => {
      const response = await axiosInstance({
        url: ApiRoutes.booking.createBooking.path,
        method: ApiRoutes.booking.createBooking.method,
        data: bookingData,
      });
      return response.data;
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to create booking."
      );
    },
  });

  const holdBooking = useMutation({
    mutationFn: async (bookingData) => {
      const response = await axiosInstance({
        url: ApiRoutes.booking.holdRoom.path,
        method: ApiRoutes.booking.holdRoom.method,
        data: bookingData,
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Dates hold successfully!");
      return data;
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to create booking."
      );
    },
  });

  return {
    createBooking,
    isLoading: createBooking.isLoading,
    holdBooking,
    isHolding: holdBooking.isLoading,
  };
};

export const useUserBookings = () => {
  const queryClient = useQueryClient();

  /* USER BOOKINGS */
  const getUserBookings = useQuery({
    queryKey: ["getUserBookings"],
    queryFn: async () => {
      const res = await axiosInstance({
        url: ApiRoutes.booking.getUserBookings.path,
        method: ApiRoutes.booking.getUserBookings.method,
      });
      return res.data;
    },
  });

  const cancelRequestBooking = useMutation({
    mutationFn: async ({ bookingId, reason }) => {
      const response = await axiosInstance({
        url: ApiRoutes.booking.cancelBooking(bookingId).path,
        method: ApiRoutes.booking.cancelBooking(bookingId).method,
        data: { reason },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Cancel request sent!");
      queryClient.invalidateQueries(["getUserBookings"]);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to send cancel request"
      );
    },
  });

  return {
    getUserBookings,
    cancelRequestBooking,
  };
};

export const useAdminBookings = ({ enabledUpcoming, enabledHistory }) => {
  const queryClient = useQueryClient();

  const getAllBookingsAndHoldings = useQuery({
    queryKey: ["getAllBookingsAndHoldings"],
    queryFn: async () => {
      const res = await axiosInstance({
        url: ApiRoutes.booking.getAllBookingsAndHoldings.path,
        method: ApiRoutes.booking.getAllBookingsAndHoldings.method,
      });
      return res.data;
    },
    enabled: enabledUpcoming, // ✅ controlled
    staleTime: 5 * 60 * 1000,
  });

  const getAllExpiredBookingsAndHoldings = useQuery({
    queryKey: ["getAllExpiredBookingsAndHoldings"],
    queryFn: async () => {
      const res = await axiosInstance({
        url: ApiRoutes.booking.getExpiredBookingsAndHoldings.path,
        method: ApiRoutes.booking.getExpiredBookingsAndHoldings.method,
      });
      return res.data;
    },
    enabled: enabledHistory, // ✅ controlled
    staleTime: 5 * 60 * 1000,
  });

  const cancelAdminHoldings = useMutation({
    mutationFn: async (bookingId) => {
      const response = await axiosInstance({
        url: ApiRoutes.booking.cancelHold(bookingId).path,
        method: ApiRoutes.booking.cancelHold(bookingId).method,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Hold cancelled successfully!");

      queryClient.invalidateQueries(["getAllBookingsAndHoldings"]);
    },
  });

  const approveCancelBookings = useMutation({
    mutationFn: async (bookingId, status) => {
      const response = await axiosInstance({
        url: ApiRoutes.booking.approveCancelBookings(bookingId).path,
        method: ApiRoutes.booking.approveCancelBookings(bookingId).method,
        data: { status },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Cancellation approved!");

      queryClient.invalidateQueries(["getAllBookingsAndHoldings"]);
    },
  });

  const rejectCancelBookings = useMutation({
    mutationFn: async (bookingId, status) => {
      const response = await axiosInstance({
        url: ApiRoutes.booking.rejectCancelBookings(bookingId).path,
        method: ApiRoutes.booking.rejectCancelBookings(bookingId).method,
        data: { status },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Cancellation rejected!");

      queryClient.invalidateQueries(["getAllBookingsAndHoldings"]);
    },
  });

  return {
    getAllBookingsAndHoldings,
    getAllExpiredBookingsAndHoldings,
    cancelAdminHoldings,
    approveCancelBookings,
    rejectCancelBookings,
  };
};
