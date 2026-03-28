import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { ApiRoutes } from "@/utils/ApiRoutes";
import { toast } from "sonner";

const useEvent = () => {
  const queryClient = useQueryClient();

    const createEvent = useMutation({
    mutationFn: async (eventData) => {
      const res = await axiosInstance({
        url: ApiRoutes.event.createEvent.path,
        method: ApiRoutes.event.createEvent.method,
        data: eventData,
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error?.message);
    },  
  });

    const getAllEvents = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const res = await axiosInstance({
        url: ApiRoutes.event.getAllEvents.path,
        method: ApiRoutes.event.getAllEvents.method,
      });
      return res.data;
    },
    refetchOnMount: true,
  });

  const updateEvent = useMutation({
    mutationFn: async ({ eventId, eventData }) => {
      const res = await axiosInstance({
        url: ApiRoutes.event.updateEvent(eventId).path,
        method: ApiRoutes.event.updateEvent(eventId).method,
        data: eventData,
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error?.message);
    },  
  });

    const deleteEvent = useMutation({    
    mutationFn: async (eventId) => {
      const res = await axiosInstance({
        url: ApiRoutes.event.deleteEvent(eventId).path,
        method: ApiRoutes.event.deleteEvent(eventId).method,
        });
        return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error?.message);
    },
  });

    return {
    createEvent,
    getAllEvents,
    updateEvent,
    deleteEvent,
  };
}

export default useEvent;