import BG from "../../models/BG.js";

export const deleteBG = async (req, res) => {
  try {
    const bg = await BG.findById(req.params.id);

    if (!bg) {
      return res.status(404).json({ message: "BG not found" });
    }

    // Soft delete (mark as inactive)
    bg.isActive = false;
    await bg.save();

    res.json({ message: "BG removed successfully" });
  } catch (error) {
    console.error("Error deleting bg:", error);
    res.status(500).json({ message: "Server error" });
  }
};