import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { ApiRoutes } from "@/utils/ApiRoutes";

export const useAdminDashboard = ({ view = "monthly", month, year }) => {
  return useQuery({
    queryKey: ["adminDashboard", view, month, year],
    queryFn: async () => {
      const params = new URLSearchParams({ view, month, year });
      const res = await axiosInstance.get(`${ApiRoutes.adminDashboard.getAnalytics.path}?${params.toString()}`);
      return res.data;
    },
    keepPreviousData: true, // optional: keeps old data while fetching new
  });
};
