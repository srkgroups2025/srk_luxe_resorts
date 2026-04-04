import BG from "../../models/BG.js";

export const getAllBG = async (_, res) => {
  try {
    // Fetch only active BG entries
    const bgList = await BG.find({ isActive: true });

    // Format response
    const formattedBG = bgList.map(bg => ({
      id: bg._id,
      images: bg.images,
      isActive: bg.isActive
    }));

    res.status(200).json(formattedBG);
  } catch (error) {
    console.error("Error fetching BG:", error);
    res.status(500).json({ message: "Failed to fetch BG" });
  }
};
