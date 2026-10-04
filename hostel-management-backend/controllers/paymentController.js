const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Fee = require("../models/Fee");
const Payment = require("../models/Payment");

const createOrder = async (req, res) => {
    try {
        const { feeId, amount } = req.body;

        const fee = await Fee.findById(feeId);

        if (!fee) {
            return res.status(404).json({
                success: false,
                message: "Fee not found"
            });
        }

        if (
            req.user.role === "STUDENT" &&
            fee.student.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You can only pay your own fee"
            });
        }

        const paymentAmount = Number(amount);

        if (!paymentAmount || paymentAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment amount"
            });
        }

        if (paymentAmount > fee.remainingAmount) {
            return res.status(400).json({
                success: false,
                message:
                    "Payment amount cannot be greater than remaining fee"
            });
        }

        const amountInPaise = paymentAmount * 100;

        const options = {
            amount: amountInPaise,
            currency: "INR",
            receipt: `fee_${fee._id}_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        const payment = await Payment.create({
            fee: fee._id,
            student: fee.student,
            amount: paymentAmount,
            paymentMethod: "UPI",
            razorpayOrderId: order.id,
            status: "PENDING"
        });

        return res.status(201).json({
            success: true,
            message: "Razorpay order created successfully",
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            paymentId: payment._id,
            keyId: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error("Create order error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create payment order",
            error: error.message
        });
    }
};

const paymentFailed = async (req, res) => {
    try {
        const {
            paymentId,
            razorpayOrderId,
            errorCode,
            errorDescription,
            errorReason
        } = req.body;

        if (!paymentId) {
            return res.status(400).json({
                success: false,
                message: "Payment ID is required"
            });
        }

        const payment = await Payment.findById(paymentId);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment record not found"
            });
        }

        if (
            req.user.role === "STUDENT" &&
            payment.student.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You can only update your own payment"
            });
        }

        if (payment.status === "SUCCESS") {
            return res.status(400).json({
                success: false,
                message: "Payment is already successful"
            });
        }

        payment.status = "FAILED";

        if (razorpayOrderId) {
            payment.razorpayOrderId = razorpayOrderId;
        }

        payment.failureReason =
            errorDescription ||
            errorReason ||
            errorCode ||
            "Payment failed";

        payment.paymentDate = new Date();

        await payment.save();

        res.status(200).json({
            success: true,
            message: "Payment marked as failed",
            payment
        });

    } catch (error) {
        console.error("Payment failed update error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update payment status",
            error: error.message
        });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const {
            paymentId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (
            !paymentId ||
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment details are required"
            });
        }

        const payment = await Payment.findById(paymentId);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment record not found"
            });
        }

        if (
            req.user.role === "STUDENT" &&
            payment.student.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You can only verify your own payment"
            });
        }

        if (payment.status === "SUCCESS") {
            return res.status(400).json({
                success: false,
                message: "Payment already verified"
            });
        }

        if (payment.razorpayOrderId !== razorpay_order_id) {
            return res.status(400).json({
                success: false,
                message: "Razorpay order ID does not match"
            });
        }

        const generatedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(
                `${razorpay_order_id}|${razorpay_payment_id}`
            )
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            });
        }

        const fee = await Fee.findById(payment.fee);

        if (!fee) {
            return res.status(404).json({
                success: false,
                message: "Fee not found"
            });
        }

        const razorpayPayment = await razorpay.payments.fetch(
    razorpay_payment_id
);

let actualPaymentMethod = "OTHER";

if (razorpayPayment.method === "card") {
    actualPaymentMethod = "CARD";
} else if (razorpayPayment.method === "netbanking") {
    actualPaymentMethod = "NETBANKING";
} else if (razorpayPayment.method === "wallet") {
    actualPaymentMethod = "WALLET";
} else if (razorpayPayment.method === "upi") {
    actualPaymentMethod = "UPI";
}

payment.razorpayPaymentId = razorpay_payment_id;
payment.transactionId = razorpay_payment_id;
payment.paymentMethod = actualPaymentMethod;
payment.status = "SUCCESS";
payment.paymentDate = new Date();

await payment.save();

        fee.paidAmount += payment.amount;

        fee.remainingAmount =
            fee.totalAmount - fee.paidAmount;

        if (fee.remainingAmount <= 0) {
            fee.remainingAmount = 0;
            fee.status = "PAID";
        } else if (fee.paidAmount > 0) {
            fee.status = "PARTIALLY_PAID";
        } else {
            fee.status = "UNPAID";
        }

        await fee.save();

        res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            payment,
            fee
        });

    } catch (error) {
        console.error("Payment verification error:", error);

        res.status(500).json({
            success: false,
            message: "Payment verification failed",
            error: error.message
        });
    }
};

const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate("student", "name email role")
            .populate(
                "fee",
                "totalAmount paidAmount remainingAmount status"
            )
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: payments.length,
            payments
        });

    } catch (error) {
        console.error("Get all payments error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch payments",
            error: error.message
        });
    }
};

const getMyPayments = async (req, res) => {
    try {
        const payments = await Payment.find({
            student: req.user._id
        })
            .populate(
                "fee",
                "totalAmount paidAmount remainingAmount status"
            )
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: payments.length,
            payments
        });

    } catch (error) {
        console.error("Get my payments error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch your payments",
            error: error.message
        });
    }
};

module.exports = {
    createOrder,
    verifyPayment,
    getAllPayments,
    getMyPayments,
    paymentFailed
};