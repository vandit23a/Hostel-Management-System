const mongoose = require("mongoose");

const allocationSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true
    },

    allocationDate: {
        type: Date,
        default: Date.now
    },

    vacatedDate: {
        type: Date,
        default: null
    },

    status: {
        type: String,
        enum: ["ACTIVE", "VACATED"],
        default: "ACTIVE"
    }
});

module.exports = mongoose.model("Allocation", allocationSchema);