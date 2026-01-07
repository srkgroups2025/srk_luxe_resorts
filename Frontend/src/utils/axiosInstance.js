import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://srk-luxe-resorts.onrender.com",
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});


export default axiosInstance;
