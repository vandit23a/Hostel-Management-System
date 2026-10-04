const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    hostel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hostel",
        required: true
    },

    roomNumber: {
        type: String,
        required: true,
        trim: true
    },

    capacity: {
        type: Number,
        required: true,
        min: 1
    },

    occupiedCount: {
        type: Number,
        default: 0,
        min: 0
    },

    status: {
        type: String,
        enum: ["AVAILABLE", "OCCUPIED", "UNDER_MAINTENANCE"],
        default: "AVAILABLE"
    }
});

module.exports = mongoose.model("Room", roomSchema);