const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        fee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Fee",
            required: true
        },

        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        paymentDate: {
            type: Date,
            default: Date.now
        },

        paymentMethod: {
    type: String,
    enum: ["UPI", "CARD", "NETBANKING", "WALLET", "OTHER"],
    default: "OTHER"
},

        transactionId: {
            type: String,
            default: null
        },

        razorpayOrderId: {
            type: String,
            default: null
        },

        razorpayPaymentId: {
            type: String,
            default: null
        },

        failureReason: {
    type: String,
    default: null
},

        status: {
            type: String,
            enum: ["PENDING", "SUCCESS", "FAILED"],
            default: "PENDING"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Payment", paymentSchema);