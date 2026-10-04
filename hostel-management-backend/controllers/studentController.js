const bcrypt = require("bcryptjs");
const Student = require("../models/Student");
const User = require("../models/User");
const Allocation = require("../models/Allocation");
const Room = require("../models/Room");

// Create Student
const createStudent = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            studentId,
            phone,
            dateOfBirth,
            gender,
            course,
            year,
            address
        } = req.body;

        // Validate required fields
        if (
            !name ||
            !email ||
            !password ||
            !studentId ||
            !phone ||
            !dateOfBirth ||
            !gender ||
            !course ||
            !year ||
            !address
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }

        // Check if student ID already exists
        const existingStudent = await Student.findOne({ studentId });

        if (existingStudent) {
            return res.status(409).json({
                success: false,
                message: "Student ID already exists"
            });
        }

        // Create user account
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
             name,
             email,
             password: hashedPassword,
             role: "STUDENT",
             isActive: true
        });

        // Create student profile
        const student = await Student.create({
            user: user._id,
            studentId,
            phone,
            dateOfBirth,
            gender,
            course,
            year,
            address
        });

        res.status(201).json({
            success: true,
            message: "Student created successfully",
            student: {
                id: student._id,
                studentId: student.studentId,
                name: user.name,
                email: user.email,
                phone: student.phone,
                dateOfBirth: student.dateOfBirth,
                gender: student.gender,
                course: student.course,
                year: student.year,
                address: student.address
            }
        });

    } catch (error) {
        console.error("Create student error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Get All Students
const getAllStudents = async (req, res) => {
    try {
        const students = await Student.find()
            .populate("user", "name email role isActive");

        res.status(200).json({
            success: true,
            count: students.length,
            students
        });

    } catch (error) {
        console.error("Get students error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Get Logged-in Student Profile
const getMyStudentProfile = async (req, res) => {
    try {
        const student = await Student.findOne({
            user: req.user._id
        }).populate(
            "user",
            "name email role isActive"
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found"
            });
        }

        res.status(200).json({
            success: true,
            student
        });

    } catch (error) {
        console.error(
            "Get my student profile error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Update Logged-in Student Profile
const updateMyStudentProfile = async (req, res) => {
    try {
        const student = await Student.findOne({
            user: req.user._id
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found"
            });
        }

        const {
            name,
            phone,
            dateOfBirth,
            address
        } = req.body;

        // Update student fields
        if (phone !== undefined) {
            student.phone = phone;
        }

        if (dateOfBirth !== undefined) {
            student.dateOfBirth = dateOfBirth;
        }

        if (address !== undefined) {
            student.address = address;
        }

        await student.save();

        // Update user name
        const user = await User.findById(student.user);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User account not found"
            });
        }

        if (name !== undefined) {
            user.name = name;
            await user.save();
        }

        // Get updated profile
        const updatedStudent = await Student.findById(
            student._id
        ).populate(
            "user",
            "name email role isActive"
        );

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            student: updatedStudent
        });

    } catch (error) {
        console.error(
            "Update my student profile error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Get Student By ID
const getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id)
            .populate("user", "name email role isActive");

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        res.status(200).json({
            success: true,
            student
        });

    } catch (error) {
        console.error("Get student error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Search Students
const searchStudents = async (req, res) => {
    try {
        const { search } = req.query;

        if (!search || !search.trim()) {
            return res.status(400).json({
                success: false,
                message: "Search value is required"
            });
        }

        const searchValue = search.trim();

        // Find users by name or email
        const users = await User.find({
            $or: [
                {
                    name: {
                        $regex: searchValue,
                        $options: "i"
                    }
                },
                {
                    email: {
                        $regex: searchValue,
                        $options: "i"
                    }
                }
            ]
        }).select("_id");

        const userIds = users.map((user) => user._id);

        // Find rooms matching the search value
        const rooms = await Room.find({
            roomNumber: {
                $regex: searchValue,
                $options: "i"
            }
        }).select("_id");

        const roomIds = rooms.map((room) => room._id);

        // Find students allocated to matching rooms
        const roomAllocations = await Allocation.find({
            room: { $in: roomIds },
            status: "ACTIVE"
        }).select("student");

        const roomStudentIds = roomAllocations.map(
            (allocation) => allocation.student
        );

        // Find students
        const students = await Student.find({
            $or: [
                // Student ID
                {
                    studentId: {
                        $regex: searchValue,
                        $options: "i"
                    }
                },

                // Phone
                {
                    phone: {
                        $regex: searchValue,
                        $options: "i"
                    }
                },

                // Course
                {
                    course: {
                        $regex: searchValue,
                        $options: "i"
                    }
                },

                // Address
                {
                    address: {
                        $regex: searchValue,
                        $options: "i"
                    }
                },

                // Name / Email
                {
                    user: {
                        $in: userIds
                    }
                },

                // Room number
                {
                    user: {
                        $in: roomStudentIds
                    }
                }
            ]
        }).populate(
            "user",
            "name email role isActive"
        );

        res.status(200).json({
            success: true,
            count: students.length,
            students
        });

    } catch (error) {
        console.error(
            "Search students error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};




// Update Student
const updateStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        const {
            name,
            email,
            phone,
            dateOfBirth,
            gender,
            course,
            year,
            address
        } = req.body;

        // Update student profile
        if (phone !== undefined) student.phone = phone;
        if (dateOfBirth !== undefined) student.dateOfBirth = dateOfBirth;
        if (gender !== undefined) student.gender = gender;
        if (course !== undefined) student.course = course;
        if (year !== undefined) student.year = year;
        if (address !== undefined) student.address = address;

        await student.save();

        // Update user information
        const user = await User.findById(student.user);

        if (user) {
            if (name !== undefined) user.name = name;

            if (email !== undefined) {
                const existingEmail = await User.findOne({
                    email,
                    _id: { $ne: user._id }
                });

                if (existingEmail) {
                    return res.status(409).json({
                        success: false,
                        message: "Email already exists"
                    });
                }

                user.email = email;
            }

            await user.save();
        }

        const updatedStudent = await Student.findById(student._id)
            .populate("user", "name email role isActive");

        res.status(200).json({
            success: true,
            message: "Student updated successfully",
            student: updatedStudent
        });

    } catch (error) {
        console.error("Update student error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Delete Student
const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        // Delete student profile
        await Student.findByIdAndDelete(req.params.id);

        // Delete linked user account
        await User.findByIdAndDelete(student.user);

        res.status(200).json({
            success: true,
            message: "Student deleted successfully"
        });

    } catch (error) {
        console.error("Delete student error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


module.exports = {
    createStudent,
    getAllStudents,
    getMyStudentProfile,
    updateMyStudentProfile,
    getStudentById,
    searchStudents,
    updateStudent,
    deleteStudent
};