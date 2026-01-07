import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID.trim(),
  key_secret: process.env.RAZORPAY_KEY_SECRET.trim(),
});

export const createPaymentOrder = async (req, res) => {
  try {
    const { totalAmount, currency = "INR" } = req.body;

    if (!totalAmount) {
      return res.status(400).json({ message: "Total amount is required" });
    }

    const options = {
      amount: Math.round(Number(totalAmount) * 100),
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(201).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID, // 👈 SEND PUBLIC KEY
    });
  } catch (err) {
    console.error("RAZORPAY ERROR:", err);
    res.status(500).json({
      message: err?.error?.description || "Failed to create payment order",
    });
  }
};
