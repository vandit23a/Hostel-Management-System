const Room = require("../models/Room");
const Hostel = require("../models/Hostel");

// Create Room
const createRoom = async (req, res) => {
    try {
        const {
            hostel,
            roomNumber,
            capacity,
            occupiedCount,
            status
        } = req.body;

        // Validate required fields
        if (!hostel || !roomNumber || capacity === undefined) {
            return res.status(400).json({
                success: false,
                message: "Hostel, roomNumber and capacity are required"
            });
        }

        // Check hostel exists
        const existingHostel = await Hostel.findById(hostel);

        if (!existingHostel) {
            return res.status(404).json({
                success: false,
                message: "Hostel not found"
            });
        }

        // Check duplicate room number inside same hostel
        const existingRoom = await Room.findOne({
            hostel,
            roomNumber
        });

        if (existingRoom) {
            return res.status(409).json({
                success: false,
                message: "Room number already exists in this hostel"
            });
        }

        const finalOccupiedCount =
            occupiedCount !== undefined ? occupiedCount : 0;

        // Validate occupied count
        if (finalOccupiedCount < 0 || finalOccupiedCount > capacity) {
            return res.status(400).json({
                success: false,
                message: "Occupied count cannot be less than 0 or greater than capacity"
            });
        }

        // Determine status automatically if not provided
        let finalStatus = status;

        if (!finalStatus) {
            finalStatus =
                finalOccupiedCount === capacity
                    ? "OCCUPIED"
                    : "AVAILABLE";
        }

        // Validate status
        const allowedStatuses = [
            "AVAILABLE",
            "OCCUPIED",
            "UNDER_MAINTENANCE"
        ];

        if (!allowedStatuses.includes(finalStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid room status"
            });
        }

        const room = await Room.create({
            hostel,
            roomNumber,
            capacity,
            occupiedCount: finalOccupiedCount,
            status: finalStatus
        });

        const populatedRoom = await Room.findById(room._id)
            .populate("hostel", "name blockCode");

        res.status(201).json({
            success: true,
            message: "Room created successfully",
            room: populatedRoom
        });

    } catch (error) {
        console.error("Create room error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Get All Rooms
const getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find()
            .populate("hostel", "name blockCode");

        res.status(200).json({
            success: true,
            count: rooms.length,
            rooms
        });

    } catch (error) {
        console.error("Get rooms error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Get Room By ID
const getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id)
            .populate("hostel", "name blockCode");

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }

        res.status(200).json({
            success: true,
            room
        });

    } catch (error) {
        console.error("Get room error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Get Rooms By Hostel
const getRoomsByHostel = async (req, res) => {
    try {
        const rooms = await Room.find({
            hostel: req.params.hostelId
        }).populate("hostel", "name blockCode");

        res.status(200).json({
            success: true,
            count: rooms.length,
            rooms
        });

    } catch (error) {
        console.error("Get rooms by hostel error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Search Rooms By Room Number
const searchRooms = async (req, res) => {
    try {
        const { roomNumber } = req.query;

        if (!roomNumber || !roomNumber.trim()) {
            return res.status(400).json({
                success: false,
                message: "Room number is required"
            });
        }

        const rooms = await Room.find({
            roomNumber: {
                $regex: roomNumber.trim(),
                $options: "i"
            }
        }).populate("hostel", "name blockCode");

        res.status(200).json({
            success: true,
            count: rooms.length,
            rooms
        });

    } catch (error) {
        console.error("Search rooms error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Update Room
const updateRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }

        const {
            hostel,
            roomNumber,
            capacity,
            occupiedCount,
            status
        } = req.body;

        // If hostel is being changed, verify it exists
        if (hostel !== undefined) {
            const existingHostel = await Hostel.findById(hostel);

            if (!existingHostel) {
                return res.status(404).json({
                    success: false,
                    message: "Hostel not found"
                });
            }
        }

        const finalHostel = hostel !== undefined
            ? hostel
            : room.hostel;

        const finalRoomNumber = roomNumber !== undefined
            ? roomNumber
            : room.roomNumber;

        const finalCapacity = capacity !== undefined
            ? capacity
            : room.capacity;

        const finalOccupiedCount = occupiedCount !== undefined
            ? occupiedCount
            : room.occupiedCount;

        const finalStatus = status !== undefined
            ? status
            : room.status;

        // Check duplicate room number
        const duplicateRoom = await Room.findOne({
            hostel: finalHostel,
            roomNumber: finalRoomNumber,
            _id: { $ne: room._id }
        });

        if (duplicateRoom) {
            return res.status(409).json({
                success: false,
                message: "Room number already exists in this hostel"
            });
        }

        // Validate capacity
        if (finalCapacity < 1) {
            return res.status(400).json({
                success: false,
                message: "Capacity must be at least 1"
            });
        }

        // Validate occupied count
        if (
            finalOccupiedCount < 0 ||
            finalOccupiedCount > finalCapacity
        ) {
            return res.status(400).json({
                success: false,
                message: "Occupied count cannot be less than 0 or greater than capacity"
            });
        }

        const allowedStatuses = [
            "AVAILABLE",
            "OCCUPIED",
            "UNDER_MAINTENANCE"
        ];

        if (!allowedStatuses.includes(finalStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid room status"
            });
        }

        room.hostel = finalHostel;
        room.roomNumber = finalRoomNumber;
        room.capacity = finalCapacity;
        room.occupiedCount = finalOccupiedCount;
        room.status = finalStatus;

        await room.save();

        const updatedRoom = await Room.findById(room._id)
            .populate("hostel", "name blockCode");

        res.status(200).json({
            success: true,
            message: "Room updated successfully",
            room: updatedRoom
        });

    } catch (error) {
        console.error("Update room error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Delete Room
const deleteRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }

        await Room.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Room deleted successfully"
        });

    } catch (error) {
        console.error("Delete room error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


module.exports = {
    createRoom,
    getAllRooms,
    getRoomById,
    getRoomsByHostel,
    searchRooms,
    updateRoom,
    deleteRoom
};