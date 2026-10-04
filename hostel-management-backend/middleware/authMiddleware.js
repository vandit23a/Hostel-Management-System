const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided."
            });
        }

        // Extract token
        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Find user from database
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "User account is inactive"
            });
        }

        // Store complete user information
        req.user = user;

        next();

    } catch (error) {
        console.error("Authentication error:", error.message);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

module.exports = {
    protect
};