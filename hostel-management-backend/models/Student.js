const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },

    studentId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    phone: {
        type: String,
        required: true,
        trim: true
    },

    dateOfBirth: {
        type: Date,
        required: true
    },

    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        required: true
    },

    course: {
        type: String,
        required: true,
        trim: true
    },

    year: {
        type: Number,
        required: true,
        min: 1
    },

    address: {
        type: String,
        required: true,
        trim: true
    }
});

module.exports = mongoose.model("Student", studentSchema);