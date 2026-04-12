import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { ApiRoutes } from "@/utils/ApiRoutes";
import { toast } from "sonner";

const useBG = () => {
  const queryClient = useQueryClient();

    const createBG = useMutation({
    mutationFn: async (BGdata) => {
      const res = await axiosInstance({
        url: ApiRoutes.bg.createBG.path,
        method: ApiRoutes.bg.createBG.method,
        data: BGdata,
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bgQuery"] });
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.response.data.message || "Failed to create BG");
    },  
  });

    const getAllBG = useQuery({
    queryKey: ["bgQuery"],
    queryFn: async () => {
      const res = await axiosInstance({
        url: ApiRoutes.bg.getAllBG.path,
        method: ApiRoutes.bg.getAllBG.method,
      });
      return res.data;
    },
    refetchOnMount: true,
  });

    const deleteBG = useMutation({    
    mutationFn: async (bgId) => {
      const res = await axiosInstance({
        url: ApiRoutes.bg.deleteBG(bgId).path,
        method: ApiRoutes.bg.deleteBG(bgId).method,
        });
        return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bgQuery"] });
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error?.message);
    },
  });

    return {
    createBG,
    getAllBG,
    deleteBG,
  };
}

export default useBG;