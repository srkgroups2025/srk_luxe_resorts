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
// export const getReview = async (req, res) => {
//   try {
//     const filter = { approved: true };

//     const [reviews, totalReviews] = await Promise.all([
//       Review.find(filter).sort({ createdAt: -1 }),
//       Review.countDocuments(filter),
//     ]);

//     res.status(200).json({
//       success: true,
//       totalReviews,
//       reviews,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };
export const getReview = async (req, res) => {
  try {
    const filter = { approved: true };

    const reviews = await Review.aggregate([
      { $match: filter },

      // Step 1: Sort by updatedAt DESC (to get latest review per email)
      { $sort: { updatedAt: -1 } },

      // Step 2: Group by email (pick latest review)
      {
        $group: {
          _id: "$email",
          review: { $first: "$$ROOT" },
        },
      },

      // Step 3: Flatten structure
      {
        $replaceRoot: { newRoot: "$review" },
      },

      // ✅ Step 4: FINAL SORT (IMPORTANT)
      {
        $sort: {
          rating: -1,      // ⭐ 5 first
          updatedAt: -1,   // latest inside same rating
        },
      },
    ]);

    const totalReviews = reviews.length;

    res.status(200).json({
      success: true,
      totalReviews,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};



