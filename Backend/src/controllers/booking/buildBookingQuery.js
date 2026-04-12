import Room from "../../models/Room.js";

const parseFilters = (filters) => {
  if (!filters) return {};
  if (typeof filters === "string") {
    try {
      return JSON.parse(filters);
    } catch {
      return {};
    }
  }

  if (typeof filters === "object") {
    return filters;
  }

  return {};
};

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const buildDateRange = (value) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

export const buildBookingQuery = async (req, baseFilter = {}) => {
  const filters = parseFilters(req.query.filters);
  const query = { ...baseFilter };

  const bookingId = typeof filters.bookingId === "string" ? filters.bookingId.trim() : "";
  const guestName = typeof filters.guestName === "string" ? filters.guestName.trim() : "";
  const mobile = typeof filters.mobile === "string" ? filters.mobile.trim() : "";
  const roomName = typeof filters.roomName === "string" ? filters.roomName.trim() : "";
  const status = typeof filters.status === "string" ? filters.status.trim() : "";

  if (bookingId) {
    query.bookingId = { $regex: bookingId, $options: "i" };
  }

  if (guestName) {
    query["guest.name"] = { $regex: guestName, $options: "i" };
  }

  if (mobile) {
    query["guest.mobile"] = { $regex: mobile, $options: "i" };
  }

  if (roomName) {
    const roomMatches = await Room.find({
      name: { $regex: roomName, $options: "i" },
    }).select("_id");

    query.roomId = { $in: roomMatches.map((room) => room._id) };
  }

  if (status && status !== "ALL") {
    query.status = status;
  }

  const checkInRange = buildDateRange(filters.checkIn);
  if (checkInRange) {
    query.checkIn = {
      $gte: checkInRange.start,
      $lte: checkInRange.end,
    };
  }

  const checkOutRange = buildDateRange(filters.checkOut);
  if (checkOutRange) {
    query.checkOut = {
      $gte: checkOutRange.start,
      $lte: checkOutRange.end,
    };
  }

  const nights = toNumber(filters.nights);
  if (nights !== undefined) {
    query.nights = nights;
  }

  const adults = toNumber(filters.guestsAdults);
  if (adults !== undefined) {
    query["guests.adults"] = adults;
  }

  const children = toNumber(filters.guestsChildren);
  if (children !== undefined) {
    query["guests.children"] = children;
  }

  return query;
};
