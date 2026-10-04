const mongoose = require("mongoose");

const hostelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    blockCode: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },

    description: {
        type: String,
        required: true,
        trim: true
    },

    isActive: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model("Hostel", hostelSchema);