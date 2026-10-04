const express = require("express");

const {
    createFee,
    getAllFees,
    getFeeById,
    getFeesByStudent,
    getMyFees,
    updateFee,
    deleteFee
} = require("../controllers/feeController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// Create Fee - Admin only
router.post(
    "/",
    protect,
    authorize("ADMIN"),
    createFee
);

// Get All Fees - Admin and Warden
router.get(
    "/",
    protect,
    authorize("ADMIN", "WARDEN"),
    getAllFees
);

// Get My Fees - Student
router.get(
    "/my",
    protect,
    authorize("STUDENT"),
    getMyFees
);

// Get Fees By Student
router.get(
    "/student/:studentId",
    protect,
    authorize("ADMIN", "WARDEN", "STUDENT"),
    getFeesByStudent
);

// Get Fee By ID
router.get(
    "/:id",
    protect,
    authorize("ADMIN", "WARDEN", "STUDENT"),
    getFeeById
);

// Update Fee - Admin only
router.put(
    "/:id",
    protect,
    authorize("ADMIN"),
    updateFee
);

// Delete Fee - Admin only
router.delete(
    "/:id",
    protect,
    authorize("ADMIN"),
    deleteFee
);

module.exports = router;