export const processPayment = async ({
    verifyPayment,
    orderId,
    amount,
    currency,
    keyId,
    userInfo,
    onSuccess,
    onFailure,
}) => {
    if (typeof window === "undefined") return;

    /* Load Razorpay SDK */
    const loadRazorpay = () =>
        new Promise((resolve) => {
            if (window.Razorpay) return resolve(true);
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });

    const loaded = await loadRazorpay();
    if (!loaded) throw new Error("Razorpay SDK failed to load");

    if (!keyId) throw new Error("Razorpay key missing");

    const options = {
        key: keyId,
        amount,
        currency,
        name: "Your Hotel Name",
        order_id: orderId,

        handler: async (response) => {
            try {
                await verifyPayment(
                    {
                        razorpayPaymentId: response.razorpay_payment_id,
                        razorpayOrderId: response.razorpay_order_id,
                        razorpaySignature: response.razorpay_signature,
                    }
                );

                onSuccess?.();
            } catch {
                onFailure?.();
            }
        },

        prefill: {
            name: userInfo?.name || "",
            email: userInfo?.email || "",
            contact: userInfo?.mobileNumber || "",
        },

        theme: { color: "#6366f1" },

        modal: {
            ondismiss: onFailure,
        },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
};
