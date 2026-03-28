import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { ApiRoutes } from "@/utils/ApiRoutes";
import { toast } from "sonner";

const useAmenities = () => {
  const queryClient = useQueryClient();

    const createAmenities = useMutation({
    mutationFn: async (amenitiesData) => {
      const res = await axiosInstance({
        url: ApiRoutes.amenities.createAmenities.path,
        method: ApiRoutes.amenities.createAmenities.method,
        data: amenitiesData,
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["amenities"] });
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error?.message);
    },  
  });

    const getAllAmenities = useQuery({
    queryKey: ["amenities"],
    queryFn: async () => {
      const res = await axiosInstance({
        url: ApiRoutes.amenities.getAllAmenities.path,
        method: ApiRoutes.amenities.getAllAmenities.method,
      });
      return res.data;
    },
    refetchOnMount: true,
  });

  const updateAmenities = useMutation({
    mutationFn: async ({ amenitiesId, amenitiesData }) => {
      const res = await axiosInstance({
        url: ApiRoutes.amenities.updateAmenities(amenitiesId).path,
        method: ApiRoutes.amenities.updateAmenities(amenitiesId).method,
        data: amenitiesData,
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["amenities"] });
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error?.message);
    },  
  });

    const deleteAmenities = useMutation({    
    mutationFn: async (amenitiesId) => {
      const res = await axiosInstance({
        url: ApiRoutes.amenities.deleteAmenities(amenitiesId).path,
        method: ApiRoutes.amenities.deleteAmenities(amenitiesId).method,
        });
        return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["amenities"] });
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error?.message);
    },
  });

    return {
    createAmenities,
    getAllAmenities,
    updateAmenities,
    deleteAmenities,
  };
}

export default useAmenities;