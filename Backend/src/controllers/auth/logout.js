// Logout controller
const logout = (req, res) => {
    try {
        // Clear the auth_token cookie
        res.clearCookie("accessToken", {
            httpOnly: true,                        // Prevents client-side JS from accessing the cookie
            secure: process.env.NODE_ENV === "production", // HTTPS only in production
            sameSite: "lax",                        // Allow credentials with cross-origin requests
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
