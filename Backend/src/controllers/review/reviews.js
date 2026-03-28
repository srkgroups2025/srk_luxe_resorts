import Review from "../../models/Review.js";

// Create review
export const createReview = async (req, res) => {
  try {
    const { name, email, rating, comment } = req.body;

    if (!email || !name || !comment || !rating) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if this email already submitted a review (optional)
    // const alreadyReviewed = await Review.findOne({ email });
    // if (alreadyReviewed) return res.status(400).json({ message: "Already reviewed" });

    const review = await Review.create({ name, email, rating, comment });
    res.status(201).json({ message: "Review submitted", review });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// get all approved reviews
export const getReview = async (req, res) => {
  try {
    const filter = { approved: true };

    const [reviews, totalReviews] = await Promise.all([
      Review.find(filter).sort({ createdAt: -1 }),
      Review.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      totalReviews,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};



