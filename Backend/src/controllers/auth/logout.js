// Logout controller
const logout = (req, res) => {
    try {
        // Clear the auth_token cookie
        res.clearCookie("auth_token", {
            httpOnly: true,                        // Prevents client-side JS from accessing the cookie
            secure: process.env.NODE_ENV !== "development", // Only send cookie over HTTPS in production
            sameSite: "strict",                     // Helps prevent CSRF attacks
        });

        // Send success response
        return res.status(200).json({
            success: true,
            message: "Logout successful."
        });
    } catch (error) {
        console.error("Error in logout:", error);

        // Send error response
        return res.status(500).json({
            success: false,
            message: "Logout failed. Try again later."
        });
    }
};

export default logout;
