const Allocation = require("../models/Allocation");
const Student = require("../models/Student");
const User = require("../models/User");
const Room = require("../models/Room");


// Helper function
// Get complete student information using User ID
const getStudentDetails = async (userId) => {
    const student = await Student.findOne({
        user: userId
    }).lean();

    if (!student) {
        return null;
    }

    const user = await User.findById(userId)
        .select("name email role isActive")
        .lean();

    if (!user) {
        return null;
    }

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        studentId: student.studentId,
        phone: student.phone,
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
        course: student.course,
        year: student.year,
        address: student.address
    };
};


// Helper function
// Format allocation response
const formatAllocation = async (allocation) => {
    const allocationObject = allocation.toObject
        ? allocation.toObject()
        : allocation;

    const studentDetails = await getStudentDetails(
        allocationObject.student
    );

    return {
        ...allocationObject,
        student: studentDetails
    };
};


// =====================================================
// CREATE ALLOCATION
// =====================================================

const createAllocation = async (req, res) => {
    try {
        const {
            student,
            room,
            allocationDate
        } = req.body;

        // Validate required fields
        if (!student || !room) {
            return res.status(400).json({
                success: false,
                message: "Student and room are required"
            });
        }


        // Check User exists
        const existingUser = await User.findById(student);

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "Student user not found"
            });
        }


        // Check User is a STUDENT
        if (existingUser.role !== "STUDENT") {
            return res.status(400).json({
                success: false,
                message: "Selected user is not a student"
            });
        }


        // Check Student profile exists
        const existingStudent = await Student.findOne({
            user: student
        });

        if (!existingStudent) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found"
            });
        }


        // Check Room exists
        const existingRoom = await Room.findById(room);

        if (!existingRoom) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }


        // Check student already has active allocation
        const existingAllocation = await Allocation.findOne({
            student: student,
            status: "ACTIVE"
        });

        if (existingAllocation) {
            return res.status(409).json({
                success: false,
                message: "Student already has an active room allocation"
            });
        }


        // Check room maintenance
        if (existingRoom.status === "UNDER_MAINTENANCE") {
            return res.status(400).json({
                success: false,
                message: "Cannot allocate student to a room under maintenance"
            });
        }


        // Check room capacity
        if (existingRoom.occupiedCount >= existingRoom.capacity) {
            return res.status(400).json({
                success: false,
                message: "Room is already full"
            });
        }


        // Create allocation
        const allocation = await Allocation.create({
            student: student,
            room: room,
            allocationDate: allocationDate || new Date(),
            vacatedDate: null,
            status: "ACTIVE"
        });


        // Increase occupied count
        existingRoom.occupiedCount =
            existingRoom.occupiedCount + 1;


        // Update room status
        if (
            existingRoom.occupiedCount >=
            existingRoom.capacity
        ) {
            existingRoom.status = "OCCUPIED";
        } else {
            existingRoom.status = "AVAILABLE";
        }


        await existingRoom.save();


        // Get complete allocation
        const populatedAllocation = await Allocation.findById(
            allocation._id
        ).populate(
            "room",
            "roomNumber capacity occupiedCount status hostel"
        );


        const responseAllocation =
            await formatAllocation(populatedAllocation);


        res.status(201).json({
            success: true,
            message: "Student allocated to room successfully",
            allocation: responseAllocation
        });


    } catch (error) {

        console.error(
            "Create allocation error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// =====================================================
// GET ALL ALLOCATIONS
// =====================================================

const getAllAllocations = async (req, res) => {
    try {

        const allocations = await Allocation.find()
            .populate(
                "room",
                "roomNumber capacity occupiedCount status hostel"
            )
            .sort({
                allocationDate: -1
            });


        const formattedAllocations =
            await Promise.all(
                allocations.map(
                    async (allocation) => {
                        return await formatAllocation(
                            allocation
                        );
                    }
                )
            );


        res.status(200).json({
            success: true,
            count: formattedAllocations.length,
            allocations: formattedAllocations
        });


    } catch (error) {

        console.error(
            "Get allocations error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// =====================================================
// GET ALLOCATION BY ID
// =====================================================

const getAllocationById = async (req, res) => {
    try {

        const allocation =
            await Allocation.findById(req.params.id)
                .populate(
                    "room",
                    "roomNumber capacity occupiedCount status hostel"
                );


        if (!allocation) {
            return res.status(404).json({
                success: false,
                message: "Allocation not found"
            });
        }


        const formattedAllocation =
            await formatAllocation(allocation);


        res.status(200).json({
            success: true,
            allocation: formattedAllocation
        });


    } catch (error) {

        console.error(
            "Get allocation error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// =====================================================
// GET ALLOCATIONS BY STUDENT
// =====================================================

const getAllocationsByStudent = async (req, res) => {
    try {

        const studentId =
            req.params.studentId;


        // Check User exists
        const studentUser =
            await User.findById(studentId);


        if (
            !studentUser ||
            studentUser.role !== "STUDENT"
        ) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }


        // Check Student profile
        const studentProfile =
            await Student.findOne({
                user: studentId
            });


        if (!studentProfile) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found"
            });
        }


        const allocations =
            await Allocation.find({
                student: studentId
            })
                .populate(
                    "room",
                    "roomNumber capacity occupiedCount status hostel"
                )
                .sort({
                    allocationDate: -1
                });


        const formattedAllocations =
            await Promise.all(
                allocations.map(
                    async (allocation) => {
                        return await formatAllocation(
                            allocation
                        );
                    }
                )
            );


        res.status(200).json({
            success: true,
            count: formattedAllocations.length,
            allocations: formattedAllocations
        });


    } catch (error) {

        console.error(
            "Get student allocations error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// =====================================================
// GET ACTIVE ALLOCATION BY STUDENT
// =====================================================

const getActiveAllocationByStudent = async (
    req,
    res
) => {
    try {

        const studentId =
            req.params.studentId;


        // Check User
        const studentUser =
            await User.findById(studentId);


        if (
            !studentUser ||
            studentUser.role !== "STUDENT"
        ) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }


        // Check Student profile
        const studentProfile =
            await Student.findOne({
                user: studentId
            });


        if (!studentProfile) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found"
            });
        }


        const allocation =
            await Allocation.findOne({
                student: studentId,
                status: "ACTIVE"
            })
                .populate({
                    path: "room",
                    select:
                        "hostel roomNumber capacity occupiedCount status",
                    populate: {
                        path: "hostel",
                        select: "name blockCode"
                    }
                });


        if (!allocation) {
            return res.status(404).json({
                success: false,
                message:
                    "No active allocation found for this student"
            });
        }


        const formattedAllocation =
            await formatAllocation(allocation);


        res.status(200).json({
            success: true,
            allocation: formattedAllocation
        });


    } catch (error) {

        console.error(
            "Get active allocation error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// =====================================================
// GET MY ACTIVE ALLOCATION
// =====================================================

const getMyAllocation = async (req, res) => {
    try {

        // JWT contains the logged-in User ID
        const studentId = req.user.userId;

        // Check User exists
        const studentUser =
            await User.findById(studentId);

        if (
            !studentUser ||
            studentUser.role !== "STUDENT"
        ) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        // Check Student profile
        const studentProfile =
            await Student.findOne({
                user: studentId
            });

        if (!studentProfile) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found"
            });
        }

        // Find active allocation
        const allocation =
            await Allocation.findOne({
                student: studentId,
                status: "ACTIVE"
            })
                .populate({
                    path: "room",
                    select:
                        "hostel roomNumber capacity occupiedCount status",
                    populate: {
                        path: "hostel",
                        select: "name blockCode"
                    }
                });

        // No active allocation
        if (!allocation) {
            return res.status(404).json({
                success: false,
                message:
                    "No active allocation found"
            });
        }

        // Format complete allocation
        const formattedAllocation =
            await formatAllocation(
                allocation
            );

        return res.status(200).json({
            success: true,
            allocation: formattedAllocation
        });

    } catch (error) {

        console.error(
            "Get my allocation error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// =====================================================
// CHANGE ROOM ALLOCATION
// =====================================================

const changeRoomAllocation = async (req, res) => {
    try {

        const allocationId = req.params.id;
        const { newRoom } = req.body;


        // Validate new room
        if (!newRoom) {
            return res.status(400).json({
                success: false,
                message: "New room is required"
            });
        }


        // Find existing allocation
        const allocation =
            await Allocation.findById(
                allocationId
            );


        if (!allocation) {
            return res.status(404).json({
                success: false,
                message: "Allocation not found"
            });
        }


        // Only active allocations can be changed
        if (allocation.status !== "ACTIVE") {
            return res.status(400).json({
                success: false,
                message:
                    "Only active room allocations can be changed"
            });
        }


        // Check if same room
        if (
            allocation.room.toString() ===
            newRoom.toString()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Student is already allocated to this room"
            });
        }


        // Get old room
        const oldRoom =
            await Room.findById(
                allocation.room
            );


        if (!oldRoom) {
            return res.status(404).json({
                success: false,
                message: "Current room not found"
            });
        }


        // Get new room
        const newRoomData =
            await Room.findById(
                newRoom
            );


        if (!newRoomData) {
            return res.status(404).json({
                success: false,
                message: "New room not found"
            });
        }


        // Check new room maintenance
        if (
            newRoomData.status ===
            "UNDER_MAINTENANCE"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Cannot change to a room under maintenance"
            });
        }


        // Check new room capacity
        if (
            newRoomData.occupiedCount >=
            newRoomData.capacity
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "New room is already full"
            });
        }


        // ============================================
        // REMOVE STUDENT FROM OLD ROOM
        // ============================================

        if (oldRoom.occupiedCount > 0) {
            oldRoom.occupiedCount =
                oldRoom.occupiedCount - 1;
        }


        if (
            oldRoom.status !==
            "UNDER_MAINTENANCE"
        ) {
            if (
                oldRoom.occupiedCount >=
                oldRoom.capacity
            ) {
                oldRoom.status = "OCCUPIED";
            } else {
                oldRoom.status = "AVAILABLE";
            }
        }


        await oldRoom.save();


        // ============================================
        // ADD STUDENT TO NEW ROOM
        // ============================================

        newRoomData.occupiedCount =
            newRoomData.occupiedCount + 1;


        if (
            newRoomData.occupiedCount >=
            newRoomData.capacity
        ) {
            newRoomData.status = "OCCUPIED";
        } else {
            newRoomData.status = "AVAILABLE";
        }


        await newRoomData.save();


        // ============================================
        // UPDATE ALLOCATION
        // ============================================

        allocation.room = newRoomData._id;

        await allocation.save();


        // ============================================
        // GET UPDATED ALLOCATION
        // ============================================

        const updatedAllocation =
            await Allocation.findById(
                allocation._id
            ).populate(
                "room",
                "roomNumber capacity occupiedCount status hostel"
            );


        const formattedAllocation =
            await formatAllocation(
                updatedAllocation
            );


        res.status(200).json({
            success: true,
            message:
                "Student room changed successfully",
            allocation: formattedAllocation
        });


    } catch (error) {

        console.error(
            "Change room allocation error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                error.message ||
                "Server error"
        });
    }
};


// =====================================================
// VACATE ALLOCATION
// =====================================================

const vacateAllocation = async (req, res) => {
    try {

        const allocation =
            await Allocation.findById(
                req.params.id
            );


        if (!allocation) {
            return res.status(404).json({
                success: false,
                message: "Allocation not found"
            });
        }


        // Check already vacated
        if (allocation.status === "VACATED") {
            return res.status(400).json({
                success: false,
                message: "Allocation is already vacated"
            });
        }


        // Get room
        const room =
            await Room.findById(
                allocation.room
            );


        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }


        // Update allocation
        allocation.status = "VACATED";
        allocation.vacatedDate = new Date();


        await allocation.save();


        // Decrease occupied count
        if (room.occupiedCount > 0) {
            room.occupiedCount =
                room.occupiedCount - 1;
        }


        // Update room status
        if (
            room.status !==
            "UNDER_MAINTENANCE"
        ) {

            if (
                room.occupiedCount >=
                room.capacity
            ) {
                room.status = "OCCUPIED";
            } else {
                room.status = "AVAILABLE";
            }
        }


        await room.save();


        // Get updated allocation
        const updatedAllocation =
            await Allocation.findById(
                allocation._id
            )
                .populate(
                    "room",
                    "roomNumber capacity occupiedCount status hostel"
                );


        const formattedAllocation =
            await formatAllocation(
                updatedAllocation
            );


        res.status(200).json({
            success: true,
            message:
                "Student vacated from room successfully",
            allocation: formattedAllocation
        });


    } catch (error) {

        console.error(
            "Vacate allocation error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    createAllocation,
    getAllAllocations,
    getAllocationById,
    getAllocationsByStudent,
    getActiveAllocationByStudent,
    getMyAllocation,
    changeRoomAllocation,
    vacateAllocation
};