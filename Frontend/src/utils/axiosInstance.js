import axios from "axios";
import { BASE_URL } from "./ApiRoutes";

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


export default axiosInstance;
