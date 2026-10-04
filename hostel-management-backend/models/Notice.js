const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        content: {
            type: String,
            required: true,
            trim: true
        },

        publishedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        targetAudience: {
            type: String,
            enum: ["ALL", "STUDENT", "WARDEN"],
            default: "ALL"
        },

        isPublished: {
            type: Boolean,
            default: true
        },

        publishDate: {
            type: Date,
            default: Date.now
        },

        expiryDate: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Notice", noticeSchema);