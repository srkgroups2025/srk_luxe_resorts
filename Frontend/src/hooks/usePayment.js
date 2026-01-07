import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { ApiRoutes } from "@/utils/ApiRoutes";
import { toast } from "sonner";

export const usePayment = () => {

    const createOrder = useMutation({
        mutationFn: async ({ totalAmount, currency = "INR" }) => {
            const response = await axiosInstance({
                url: ApiRoutes.payment.createOrder.path,
                method: ApiRoutes.payment.createOrder.method,
                data: { totalAmount, currency },
            });
            return response.data;
        },
        onError: (error) => {
            toast.error(
                error.response?.data?.message || "Failed to create payment order."
            );
        },
    });

    const verifyPayment = useMutation({
        mutationFn: async (paymentData) => {
            const response = await axiosInstance({
                url: ApiRoutes.payment.verifyPayment.path,
                method: ApiRoutes.payment.verifyPayment.method,
                data: paymentData,
            });
            return response.data;
        },
        onError: (error) => {
            toast.error(
                error.response?.data?.message || "Payment verification failed."
            );
        },
    });

    return {
        createOrder,
        isCreatingOrder: createOrder.isPending,
        verifyPayment,
        isVerifying: verifyPayment.isPending,
    };
};