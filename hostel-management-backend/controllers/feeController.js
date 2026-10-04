const Fee = require("../models/Fee");
const User = require("../models/User");
const Student = require("../models/Student");

// Create Fee
const createFee = async (req, res) => {
    try {
        const {
            student,
            totalAmount,
            paidAmount,
            dueDate
        } = req.body;

        // Validate required fields
        if (
            !student ||
            totalAmount === undefined ||
            !dueDate
        ) {
            return res.status(400).json({
                success: false,
                message: "Student, totalAmount and dueDate are required"
            });
        }

        // Validate amounts
        if (totalAmount < 0) {
            return res.status(400).json({
                success: false,
                message: "Total amount cannot be negative"
            });
        }

        const finalPaidAmount =
            paidAmount !== undefined ? paidAmount : 0;

        if (finalPaidAmount < 0) {
            return res.status(400).json({
                success: false,
                message: "Paid amount cannot be negative"
            });
        }

        if (finalPaidAmount > totalAmount) {
            return res.status(400).json({
                success: false,
                message: "Paid amount cannot be greater than total amount"
            });
        }

        // Find Student using Student ID
        const Student = require("../models/Student");

        const studentRecord = await Student.findOne({
            studentId: student
        });

        if (!studentRecord) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        // Get corresponding User
        const existingStudent = await User.findOne({
            _id: studentRecord.user,
            role: "STUDENT"
        });

        if (!existingStudent) {
            return res.status(404).json({
                success: false,
                message: "Student user not found"
            });
        }

        // Calculate remaining amount
        const remainingAmount =
            totalAmount - finalPaidAmount;

        // Determine status automatically
        let status = "UNPAID";

        if (finalPaidAmount === totalAmount) {
            status = "PAID";
        } else if (finalPaidAmount > 0) {
            status = "PARTIALLY_PAID";
        }

        // Create fee using User ObjectId
        const fee = await Fee.create({
            student: existingStudent._id,
            totalAmount,
            paidAmount: finalPaidAmount,
            remainingAmount,
            status,
            dueDate
        });

        const populatedFee = await Fee.findById(fee._id)
            .populate(
                "student",
                "name email role isActive"
            );

        res.status(201).json({
            success: true,
            message: "Fee created successfully",
            fee: populatedFee
        });

    } catch (error) {
        console.error("Create fee error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Get All Fees
const getAllFees = async (req, res) => {
    try {
        const fees = await Fee.find()
            .populate(
                "student",
                "name email role isActive"
            )
            .sort({ dueDate: 1 });

        res.status(200).json({
            success: true,
            count: fees.length,
            fees
        });

    } catch (error) {
        console.error("Get fees error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Get Fee By ID
const getFeeById = async (req, res) => {
    try {
        const fee = await Fee.findById(req.params.id)
            .populate(
                "student",
                "name email role isActive"
            );

        if (!fee) {
            return res.status(404).json({
                success: false,
                message: "Fee record not found"
            });
        }

        res.status(200).json({
            success: true,
            fee
        });

    } catch (error) {
        console.error("Get fee error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Get Fees By Student
const getFeesByStudent = async (req, res) => {
    try {
        const fees = await Fee.find({
            student: req.params.studentId
        })
            .populate(
                "student",
                "name email role isActive"
            )
            .sort({ dueDate: 1 });

        res.status(200).json({
            success: true,
            count: fees.length,
            fees
        });

    } catch (error) {
        console.error(
            "Get student fees error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Get My Fees
const getMyFees = async (req, res) => {
    try {
        const fees = await Fee.find({
            student: req.user._id
        }).sort({ dueDate: 1 });

        res.status(200).json({
            success: true,
            count: fees.length,
            fees
        });

    } catch (error) {
        console.error(
            "Get my fees error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Update Fee
const updateFee = async (req, res) => {
    try {
        const fee = await Fee.findById(req.params.id);

        if (!fee) {
            return res.status(404).json({
                success: false,
                message: "Fee record not found"
            });
        }

        const {
            totalAmount,
            paidAmount,
            dueDate
        } = req.body;

        const finalTotalAmount =
            totalAmount !== undefined
                ? totalAmount
                : fee.totalAmount;

        const finalPaidAmount =
            paidAmount !== undefined
                ? paidAmount
                : fee.paidAmount;

        // Validate amounts
        if (finalTotalAmount < 0) {
            return res.status(400).json({
                success: false,
                message: "Total amount cannot be negative"
            });
        }

        if (finalPaidAmount < 0) {
            return res.status(400).json({
                success: false,
                message: "Paid amount cannot be negative"
            });
        }

        if (finalPaidAmount > finalTotalAmount) {
            return res.status(400).json({
                success: false,
                message: "Paid amount cannot be greater than total amount"
            });
        }

        const remainingAmount =
            finalTotalAmount - finalPaidAmount;

        let status = "UNPAID";

        if (finalPaidAmount === finalTotalAmount) {
            status = "PAID";
        } else if (finalPaidAmount > 0) {
            status = "PARTIALLY_PAID";
        }

        fee.totalAmount = finalTotalAmount;
        fee.paidAmount = finalPaidAmount;
        fee.remainingAmount = remainingAmount;
        fee.status = status;

        if (dueDate !== undefined) {
            fee.dueDate = dueDate;
        }

        await fee.save();

        const updatedFee = await Fee.findById(fee._id)
            .populate(
                "student",
                "name email role isActive"
            );

        res.status(200).json({
            success: true,
            message: "Fee updated successfully",
            fee: updatedFee
        });

    } catch (error) {
        console.error("Update fee error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Delete Fee
const deleteFee = async (req, res) => {
    try {
        const fee = await Fee.findById(req.params.id);

        if (!fee) {
            return res.status(404).json({
                success: false,
                message: "Fee record not found"
            });
        }

        await Fee.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Fee deleted successfully"
        });

    } catch (error) {
        console.error("Delete fee error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


module.exports = {
    createFee,
    getAllFees,
    getFeeById,
    getFeesByStudent,
    getMyFees,
    updateFee,
    deleteFee
};