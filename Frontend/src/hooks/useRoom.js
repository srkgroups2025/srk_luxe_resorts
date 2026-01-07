import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { ApiRoutes } from "@/utils/ApiRoutes";
import { toast } from "sonner";

const useRoom = () => {
  const queryClient = useQueryClient();

    const createRoom = useMutation({
    mutationFn: async (roomData) => {
      const res = await axiosInstance({
        url: ApiRoutes.room.createRoom.path,
        method: ApiRoutes.room.createRoom.method,
        data: roomData,
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error?.message);
    },  
  });

    const getAllRooms = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const res = await axiosInstance({
        url: ApiRoutes.room.getAllRooms.path,
        method: ApiRoutes.room.getAllRooms.method,
      });
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateRoom = useMutation({
    mutationFn: async ({ roomId, roomData }) => {
      const res = await axiosInstance({
        url: ApiRoutes.room.updateRoom(roomId).path,
        method: ApiRoutes.room.updateRoom(roomId).method,
        data: roomData,
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error?.message);
    },  
  });

    const deleteRoom = useMutation({    
    mutationFn: async (roomId) => {
      const res = await axiosInstance({
        url: ApiRoutes.room.deleteRoom(roomId).path,
        method: ApiRoutes.room.deleteRoom(roomId).method,
        });
        return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error?.message);
    },
  });

    return {
    createRoom,
    getAllRooms,
    updateRoom,
    deleteRoom,
  };
}

export default useRoom;