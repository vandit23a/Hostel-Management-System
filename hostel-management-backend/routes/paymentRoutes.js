const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const {
    createOrder,
    verifyPayment,
    getAllPayments,
    getMyPayments,
    paymentFailed
} = require("../controllers/paymentController");

// Create Razorpay payment order
router.post(
    "/create-order",
    protect,
    authorize("STUDENT"),
    createOrder
);

// Verify Razorpay payment
router.post(
    "/verify",
    protect,
    authorize("STUDENT"),
    verifyPayment
);

// Get all payments
router.get(
    "/",
    protect,
    authorize("ADMIN", "WARDEN"),
    getAllPayments
);

// Get my payments
router.get(
    "/my",
    protect,
    authorize("STUDENT"),
    getMyPayments
);

router.post(
    "/failed",
    protect,
    authorize("STUDENT"),
    paymentFailed
);

module.exports = router;