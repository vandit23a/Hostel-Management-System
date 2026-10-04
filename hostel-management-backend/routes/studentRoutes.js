const express = require("express");

const {
    createStudent,
    getAllStudents,
    getStudentById,
    getMyStudentProfile,
    updateMyStudentProfile,
    searchStudents,
    updateStudent,
    deleteStudent
} = require("../controllers/studentController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// Create student - Admin and Warden
router.post(
    "/",
    protect,
    authorize("ADMIN", "WARDEN"),
    createStudent
);

// Get all students - Admin and Warden
router.get(
    "/",
    protect,
    authorize("ADMIN", "WARDEN"),
    getAllStudents
);

// Search students - Admin and Warden
router.get(
    "/search",
    protect,
    authorize("ADMIN", "WARDEN"),
    searchStudents
);

// Get logged-in student profile
router.get(
    "/me",
    protect,
    authorize("STUDENT"),
    getMyStudentProfile
);

// Update logged-in student profile

router.put(
    "/me",
    protect,
    authorize("STUDENT"),
    updateMyStudentProfile
);

// Get student by ID - Admin, Warden and Student
router.get(
    "/:id",
    protect,
    authorize("ADMIN", "WARDEN", "STUDENT"),
    getStudentById
);

// Update student - Admin and Warden
router.put(
    "/:id",
    protect,
    authorize("ADMIN", "WARDEN"),
    updateStudent
);

// Delete student - Admin only
router.delete(
    "/:id",
    protect,
    authorize("ADMIN"),
    deleteStudent
);

module.exports = router;