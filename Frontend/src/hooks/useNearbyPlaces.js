import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { ApiRoutes } from "@/utils/ApiRoutes";
import { toast } from "sonner";

const useNearbyPlaces = () => {
  const queryClient = useQueryClient();

    const createNearbyPlaces = useMutation({
    mutationFn: async (nearbyPlacesData) => {
      const res = await axiosInstance({
        url: ApiRoutes.nearbyPlaces.createNearbyPlaces.path,
        method: ApiRoutes.nearbyPlaces.createNearbyPlaces.method,
        data: nearbyPlacesData,
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["nearbyPlaces"] });
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.response.data.message || "Failed to create nearby places");
    },  
  });

    const getAllNearbyPlaces = useQuery({
    queryKey: ["nearbyPlaces"],
    queryFn: async () => {
      const res = await axiosInstance({
        url: ApiRoutes.nearbyPlaces.getAllNearbyPlaces.path,
        method: ApiRoutes.nearbyPlaces.getAllNearbyPlaces.method,
      });
      return res.data;
    },
    refetchOnMount: true,
  });

  const updateNearbyPlaces = useMutation({
    mutationFn: async ({ nearbyPlacesId, nearbyPlacesData }) => {
      const res = await axiosInstance({
        url: ApiRoutes.nearbyPlaces.updateNearbyPlaces(nearbyPlacesId).path,
        method: ApiRoutes.nearbyPlaces.updateNearbyPlaces(nearbyPlacesId).method,
        data: nearbyPlacesData,
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["nearbyPlaces"] });
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.response.data.message || "Failed to update nearby places");
    },  
  });

    const deleteNearbyPlaces = useMutation({    
    mutationFn: async (nearbyPlacesId) => {
      const res = await axiosInstance({
        url: ApiRoutes.nearbyPlaces.deleteNearbyPlaces(nearbyPlacesId).path,
        method: ApiRoutes.nearbyPlaces.deleteNearbyPlaces(nearbyPlacesId).method,
        });
        return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["nearbyPlaces"] });
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error?.message);
    },
  });

    return {
    createNearbyPlaces,
    getAllNearbyPlaces,
    updateNearbyPlaces,
    deleteNearbyPlaces,
  };
}

export default useNearbyPlaces;