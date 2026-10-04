const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },

        paidAmount: {
            type: Number,
            default: 0,
            min: 0
        },

        remainingAmount: {
            type: Number,
            required: true,
            min: 0
        },

        dueDate: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: [
                "UNPAID",
                "PARTIALLY_PAID",
                "PAID"
            ],
            default: "UNPAID"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Fee", feeSchema);