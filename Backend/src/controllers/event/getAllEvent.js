import Event from "../../models/Event.js";

export const getAllEvent = async (_, res) => {
  try {
    // Fetch only active Event
    const events = await Event.find({ isActive: true });

    // Optional: format the response if needed
    const formattedEvents = events.map((event) => ({
      id: event._id,
      name: event.name,
      images: event.images,
    }));

    res.status(200).json(formattedEvents);
  } catch (error) {
    console.error("Error fetching Event:", error);
    res.status(500).json({ message: "Failed to fetch Event" });
  }
};
