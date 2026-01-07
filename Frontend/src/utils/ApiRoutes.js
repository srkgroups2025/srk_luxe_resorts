import path from "path";

export const ApiRoutes = {
  auth: {
    sendOtp: { path: "/api/auth/send-mobile-otp", method: "POST" },
    verifyMobile: { path: "/api/auth/verify-mobile-otp", method: "POST" },
    signup: { path: "/api/auth/signup", method: "POST" },
    verifyEmail: { path: "/api/auth/verify-email/:token", method: "GET" },
    login: { path: "/api/auth/login", method: "POST" },
    forgotPassword: { path: "/api/auth/forgot-password", method: "POST" },
    resetPassword: (token) => ({
      path: `/api/auth/reset-password/${token}`,
      method: "PUT",
    }),
    logout: { path: "/api/auth/logout", method: "POST" },
  },

  user: {
    getProfile: { path: "/api/auth/me", method: "GET" },
    updateProfile: { path: "/api/auth/update", method: "PUT" },
  },

  room: {
    createRoom: { path: "/api/rooms/create", method: "POST" },
    getAllRooms: { path: "/api/rooms/", method: "GET" },
    getRoomById: (roomId) => ({
      path: `/api/rooms/${roomId}`,
      method: "GET",
    }),
    updateRoom: (roomId) => ({
      path: `/api/rooms/update/${roomId}`,
      method: "PUT",
    }),
    deleteRoom: (roomId) => ({
      path: `/api/rooms/delete/${roomId}`,
      method: "DELETE",
    }),
  },

  booking: {
    /* CUSTOMER */
    createBooking: { path: "/api/bookings/book", method: "POST" },
    getUserBookings: { path: "/api/bookings/user", method: "GET" },
    cancelBooking: (bookingId) => ({
      path: `/api/bookings/book/${bookingId}/cancel`,
      method: "PATCH",
    }),

    /* ADMIN */
    holdRoom: { path: "/api/bookings/hold", method: "POST" },
    cancelHold: (bookingId) => ({
      path: `/api/bookings/hold/${bookingId}/cancel`,
      method: "DELETE",
    }),
    getAllBookingsAndHoldings: {
      path: "/api/bookings/all",
      method: "GET",
    },
    getExpiredBookingsAndHoldings: {
      path: "/api/bookings/expired",
      method: "GET",
    },
    approveCancelBookings: (bookingId) => ({
      path: `/api/bookings/book/${bookingId}/approve-cancel`,
      method: "PATCH",
    }),
    rejectCancelBookings: (bookingId) => ({
      path: `/api/bookings/book/${bookingId}/reject-cancel`,
      method: "PATCH",
    }),
  },

  adminDashboard: {
    getAnalytics: { path: "/api/admin/analytics", method: "GET" },
  },

  payment: {
    createOrder: { path: "/api/payment/create-order", method: "POST" },
    verifyPayment: { path: "/api/payment/verify", method: "POST" },
  },
};
