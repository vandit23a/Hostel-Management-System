const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            enum: ["PENDING", "IN_PROGRESS", "RESOLVED"],
            default: "PENDING"
        },

        remarks: {
            type: String,
            default: "",
            trim: true
        },

        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        resolvedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Complaint", complaintSchema);