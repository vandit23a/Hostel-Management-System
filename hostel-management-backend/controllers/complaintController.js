const Complaint = require("../models/Complaint");
const User = require("../models/User");

// Create Complaint
const createComplaint = async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: "Title and description are required"
            });
        }

        const complaint = await Complaint.create({
            student: req.user._id,
            title,
            description,
            status: "PENDING"
        });

        const populatedComplaint = await Complaint.findById(
            complaint._id
        ).populate(
            "student",
            "name email role isActive"
        );

        res.status(201).json({
            success: true,
            message: "Complaint created successfully",
            complaint: populatedComplaint
        });

    } catch (error) {
        console.error(
            "Create complaint error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Get All Complaints
const getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate(
                "student",
                "name email role isActive"
            )
            .populate(
                "resolvedBy",
                "name email role"
            )
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: complaints.length,
            complaints
        });

    } catch (error) {
        console.error(
            "Get complaints error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Get Complaint By ID
const getComplaintById = async (req, res) => {
    try {
        const complaint = await Complaint.findById(
            req.params.id
        )
            .populate(
                "student",
                "name email role isActive"
            )
            .populate(
                "resolvedBy",
                "name email role"
            );

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found"
            });
        }

        res.status(200).json({
            success: true,
            complaint
        });

    } catch (error) {
        console.error(
            "Get complaint error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Get My Complaints
const getMyComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({
            student: req.user._id
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: complaints.length,
            complaints
        });

    } catch (error) {
        console.error(
            "Get my complaints error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Update complaint status
const updateComplaintStatus = async (req, res) => {
    try {
        const { status, remarks } = req.body;

        const validStatuses = [
            "PENDING",
            "IN_PROGRESS",
            "RESOLVED"
        ];

        // Validate status
        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Complaint status is required"
            });
        }

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid complaint status"
            });
        }

        // Find complaint
        const complaint = await Complaint.findById(
            req.params.id
        );

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found"
            });
        }

        // Resolved complaints cannot be modified
if (complaint.status === "RESOLVED") {
    return res.status(400).json({
        success: false,
        message: "Resolved complaint cannot be modified"
    });
}

        // Update status
        complaint.status = status;

        // Update remarks if provided
        if (remarks !== undefined) {
            complaint.remarks = remarks;
        }

        await complaint.save();

        return res.status(200).json({
            success: true,
            message: "Complaint status updated successfully",
            complaint
        });

    } catch (error) {
        console.error(
            "Update complaint status error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to update complaint status",
            error: error.message
        });
    }
};


// Delete Complaint
const deleteComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(
            req.params.id
        );

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found"
            });
        }

        await Complaint.findByIdAndDelete(
            req.params.id
        );

        res.status(200).json({
            success: true,
            message: "Complaint deleted successfully"
        });

    } catch (error) {
        console.error(
            "Delete complaint error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


module.exports = {
    createComplaint,
    getAllComplaints,
    getComplaintById,
    getMyComplaints,
    updateComplaintStatus,
    deleteComplaint
};