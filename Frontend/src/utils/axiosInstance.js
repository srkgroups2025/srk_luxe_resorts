import axios from "axios";
import { BASE_URL } from "./ApiRoutes";
import { emitAuthChange } from "./authEvents";

const axiosInstance = axios.create({
  baseURL: BASE_URL ,
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

// Response interceptor for handling token expiration
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      handleTokenExpiration();
    }
    return Promise.reject(error);
  }
);

// Auto logout when token expires
const handleTokenExpiration = () => {
  // Clear localStorage
  localStorage.removeItem("userInfo");
  localStorage.removeItem("accessToken");

  // Clear cookies
  document.cookie = "userInfo=; path=/; max-age=0";
  document.cookie = "accessToken=; path=/; max-age=0";

  // Emit auth change event to trigger UI updates
  emitAuthChange();

  // Redirect to home page
  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
};

export default axiosInstance;
