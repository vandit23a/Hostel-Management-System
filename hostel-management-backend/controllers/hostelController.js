const Hostel = require("../models/Hostel");

// Create Hostel
const createHostel = async (req, res) => {
    try {
        const {
            name,
            blockCode,
            description,
            isActive
        } = req.body;

        // Validate required fields
        if (!name || !blockCode || !description) {
            return res.status(400).json({
                success: false,
                message: "Name, blockCode and description are required"
            });
        }

        // Check duplicate block code
        const existingHostel = await Hostel.findOne({
            blockCode: blockCode.toUpperCase()
        });

        if (existingHostel) {
            return res.status(409).json({
                success: false,
                message: "Hostel block code already exists"
            });
        }

        const hostel = await Hostel.create({
            name,
            blockCode,
            description,
            isActive: isActive !== undefined ? isActive : true
        });

        res.status(201).json({
            success: true,
            message: "Hostel created successfully",
            hostel
        });

    } catch (error) {
        console.error("Create hostel error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Get All Hostels
const getAllHostels = async (req, res) => {
    try {
        const hostels = await Hostel.find();

        res.status(200).json({
            success: true,
            count: hostels.length,
            hostels
        });

    } catch (error) {
        console.error("Get hostels error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Get Hostel By ID
const getHostelById = async (req, res) => {
    try {
        const hostel = await Hostel.findById(req.params.id);

        if (!hostel) {
            return res.status(404).json({
                success: false,
                message: "Hostel not found"
            });
        }

        res.status(200).json({
            success: true,
            hostel
        });

    } catch (error) {
        console.error("Get hostel error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Update Hostel
const updateHostel = async (req, res) => {
    try {
        const hostel = await Hostel.findById(req.params.id);

        if (!hostel) {
            return res.status(404).json({
                success: false,
                message: "Hostel not found"
            });
        }

        const {
            name,
            blockCode,
            description,
            isActive
        } = req.body;

        // Check if new blockCode already belongs to another hostel
        if (blockCode !== undefined) {
            const existingHostel = await Hostel.findOne({
                blockCode: blockCode.toUpperCase(),
                _id: { $ne: hostel._id }
            });

            if (existingHostel) {
                return res.status(409).json({
                    success: false,
                    message: "Hostel block code already exists"
                });
            }

            hostel.blockCode = blockCode;
        }

        if (name !== undefined) {
            hostel.name = name;
        }

        if (description !== undefined) {
            hostel.description = description;
        }

        if (isActive !== undefined) {
            hostel.isActive = isActive;
        }

        await hostel.save();

        res.status(200).json({
            success: true,
            message: "Hostel updated successfully",
            hostel
        });

    } catch (error) {
        console.error("Update hostel error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Delete Hostel
const deleteHostel = async (req, res) => {
    try {
        const hostel = await Hostel.findById(req.params.id);

        if (!hostel) {
            return res.status(404).json({
                success: false,
                message: "Hostel not found"
            });
        }

        await Hostel.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Hostel deleted successfully"
        });

    } catch (error) {
        console.error("Delete hostel error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


module.exports = {
    createHostel,
    getAllHostels,
    getHostelById,
    updateHostel,
    deleteHostel
};