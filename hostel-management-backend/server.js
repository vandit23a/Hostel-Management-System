const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const hostelRoutes = require("./routes/hostelRoutes");
const roomRoutes = require("./routes/roomRoutes");
const allocationRoutes = require("./routes/allocationRoutes");
const feeRoutes = require("./routes/feeRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/hostels", hostelRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/allocations", allocationRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/payments", paymentRoutes);

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "Hostel Management Backend is running"
    });
});

// MongoDB connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Atlas connected successfully");

        app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:");
        console.error(error.message);
    });