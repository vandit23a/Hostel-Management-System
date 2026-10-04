const express = require("express");
const { login } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// Login
router.post("/login", login);

// Protected route - any logged-in user
router.get("/profile", protect, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Authentication successful",
        user: req.user
    });
});

// Admin-only test route
router.get(
    "/admin-test",
    protect,
    authorize("ADMIN"),
    (req, res) => {
        res.status(200).json({
            success: true,
            message: "Admin authorization successful",
            user: req.user
        });
    }
);

module.exports = router;