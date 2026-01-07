export const getProfile = async (req, res) => {
  try {
    const user = req.user;

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
        image: user.image || null,
        createdAt: user.createdAt,
        totalBookings: user.totalBookings || 0,
        lastLogin: user.lastLogin || null,
      },
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
