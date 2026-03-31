import path from "path";

export const BASE_URL =
  "https://api.srkluxeresortsudumalpet.com" 
  // "http://localhost:5000";

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

  amenities: {
    createAmenities: { path: "/api/amenities/create", method: "POST" },
    getAllAmenities: { path: "/api/amenities/", method: "GET" },
    getAmenitiesById: (amenitiesId) => ({
      path: `/api/amenities/${amenitiesId}`,
      method: "GET",
    }),
    updateAmenities: (amenitiesId) => ({
      path: `/api/amenities/update/${amenitiesId}`,
      method: "PUT",
    }),
    deleteAmenities: (amenitiesId) => ({
      path: `/api/amenities/delete/${amenitiesId}`,
      method: "DELETE",
    }),
  },

  nearbyPlaces: {
    createNearbyPlaces: { path: "/api/nearby-places/create", method: "POST" },
    getAllNearbyPlaces: { path: "/api/nearby-places/", method: "GET" },
    getNearbyPlacesById: (nearbyPlacesId) => ({
      path: `/api/nearby-places/${nearbyPlacesId}`,
      method: "GET",
    }),
    updateNearbyPlaces: (nearbyPlacesId) => ({
      path: `/api/nearby-places/update/${nearbyPlacesId}`,
      method: "PUT",
    }),
    deleteNearbyPlaces: (nearbyPlacesId) => ({
      path: `/api/nearby-places/delete/${nearbyPlacesId}`,
      method: "DELETE",
    }),
  },

  event: {
    createEvent: { path: "/api/events/create", method: "POST" },
    getAllEvents: { path: "/api/events/", method: "GET" },
    getEventById: (eventId) => ({
      path: `/api/events/${eventId}`,
      method: "GET",
    }),
    updateEvent: (eventId) => ({
      path: `/api/events/update/${eventId}`,
      method: "PUT",
    }),
    deleteEvent: (eventId) => ({
      path: `/api/events/delete/${eventId}`,
      method: "DELETE",
    }),
  },

  booking: {
    /* CUSTOMER */
    createPendingBooking: { path: "/api/bookings/book/pending", method: "POST" },
    confirmBooking: { path: "/api/bookings/book/confirm", method: "PATCH" },
    cancelPendingBooking: { path: "/api/bookings/book/cancel", method: "DELETE" },
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

  review: {
    createReview: { path: "/api/reviews/create", method: "POST" },
    getReview: { path: "/api/reviews/", method: "GET" },
  },
};
