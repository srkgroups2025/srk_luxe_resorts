import {
  keepPreviousData,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { ApiRoutes } from "@/utils/ApiRoutes";
import { toast } from "sonner";

export const useCreateAndHoldBooking = () => {
  const queryClient = useQueryClient();

  const createPendingBooking = useMutation({
    mutationFn: async (bookingData) => {
      const res = await axiosInstance({
        url: ApiRoutes.booking.createPendingBooking.path,
        method: ApiRoutes.booking.createPendingBooking.method,
        data: bookingData,
      });
      return res.data;
    },
  });

  const confirmBooking = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance({
        url: ApiRoutes.booking.confirmBooking.path,
        method: ApiRoutes.booking.confirmBooking.method,
        data,
      });
      return res.data;
    },
  });

  const cancelPendingBooking = useMutation({
    mutationFn: async (bookingId) => {
      const res = await axiosInstance({
        url: ApiRoutes.booking.cancelPendingBooking.path,
        method: ApiRoutes.booking.cancelPendingBooking.method,
        data: { bookingId },
      });
      return res.data;
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
    createPendingBooking,
    isCreateLoading: createPendingBooking.isPending,
    isCreatePending: createPendingBooking.isPending,
    confirmBooking,
    isConfirmLoading: confirmBooking.isPending,
    isConfirmPending: confirmBooking.isPending,
    cancelPendingBooking,
    isCancelLoading: cancelPendingBooking.isPending,
    isCancelPending: cancelPendingBooking.isPending,
    holdBooking,
    isHolding: holdBooking.isPending,
    isHoldingPending: holdBooking.isPending,
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
      queryClient.invalidateQueries({ queryKey: ["getUserBookings"] });
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

export const useAdminBookings = ({
  enabledUpcoming,
  enabledHistory,
  upcomingPage = 1,
  historyPage = 1,
  limit = 10,
  filters = {},
}) => {
  const queryClient = useQueryClient();
  const filtersKey = JSON.stringify(filters || {});
  const normalizeBookingResponse = (data) => ({
    count: data?.count ?? 0,
    totalPages: data?.totalPages ?? 0,
    currentPage: data?.currentPage ?? 1,
    limit: data?.limit ?? limit,
    data: Array.isArray(data?.data) ? data.data : [],
  });

  const getAllBookingsAndHoldings = useQuery({
    queryKey: ["getAllBookingsAndHoldings", upcomingPage, limit, filtersKey],
    queryFn: async () => {
      const res = await axiosInstance({
        url: ApiRoutes.booking.getAllBookingsAndHoldings.path,
        method: ApiRoutes.booking.getAllBookingsAndHoldings.method,
        params: {
          page: upcomingPage,
          limit,
          filters: filtersKey,
        },
      });
      return normalizeBookingResponse(res.data);
    },
    enabled: enabledUpcoming,
    placeholderData: keepPreviousData,
  });

  const getAllExpiredBookingsAndHoldings = useQuery({
    queryKey: ["getAllExpiredBookingsAndHoldings", historyPage, limit, filtersKey],
    queryFn: async () => {
      const res = await axiosInstance({
        url: ApiRoutes.booking.getExpiredBookingsAndHoldings.path,
        method: ApiRoutes.booking.getExpiredBookingsAndHoldings.method,
        params: {
          page: historyPage,
          limit,
          filters: filtersKey,
        },
      });
      return normalizeBookingResponse(res.data);
    },
    enabled: enabledHistory,
    placeholderData: keepPreviousData,
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

      queryClient.invalidateQueries({ queryKey: ["getAllBookingsAndHoldings"] });
      queryClient.invalidateQueries({ queryKey: ["getAllExpiredBookingsAndHoldings"] });
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

      queryClient.invalidateQueries({ queryKey: ["getAllBookingsAndHoldings"] });
      queryClient.invalidateQueries({ queryKey: ["getAllExpiredBookingsAndHoldings"] });
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

      queryClient.invalidateQueries({ queryKey: ["getAllBookingsAndHoldings"] });
      queryClient.invalidateQueries({ queryKey: ["getAllExpiredBookingsAndHoldings"] });
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
