import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { ApiRoutes } from "@/utils/ApiRoutes";
import { toast } from "sonner";

const useReview = () => {

    const createReview = useMutation({
        mutationFn: async (bookingData) => {
            const response = await axiosInstance({
                url: ApiRoutes.review.createReview.path,
                method: ApiRoutes.review.createReview.method,
                data: bookingData,
            });
            return response.data;
        },
        onError: (error) => {
            toast.error(
                error.response?.data?.message || "Failed to create review."
            );
        },
    });

    const getReview = useQuery({
        queryKey: ["getReview"],
        queryFn: async () => {
            const res = await axiosInstance({
                url: ApiRoutes.review.getReview.path,
                method: ApiRoutes.review.getReview.method,
            });
            return res.data;
        },
    });

    return {
        createReview,
        getReview,
    }
}

export default useReview;

