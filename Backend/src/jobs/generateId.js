import Counter from "../models/Counter.js";

// Generic counter function
const getNextSequence = async (name) => {
  const counter = await Counter.findOneAndUpdate(
    { name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return counter.seq;
};

// BOOKING ID → BO000001
export const generateBookingId = async () => {
  const seq = await getNextSequence("booking");

  return `BO${String(seq).padStart(6, "0")}`;
};

// HOLDING ID → HO000001
export const generateHoldingId = async () => {
  const seq = await getNextSequence("holding");

  return `HO${String(seq).padStart(6, "0")}`;
};
