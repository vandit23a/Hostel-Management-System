const express = require("express");

const {
    createHostel,
    getAllHostels,
    getHostelById,
    updateHostel,
    deleteHostel
} = require("../controllers/hostelController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// Create Hostel - Admin only
router.post(
    "/",
    protect,
    authorize("ADMIN"),
    createHostel
);

// Get All Hostels - Admin, Warden, Student
router.get(
    "/",
    protect,
    authorize("ADMIN", "WARDEN", "STUDENT"),
    getAllHostels
);

// Get Hostel By ID - Admin, Warden, Student
router.get(
    "/:id",
    protect,
    authorize("ADMIN", "WARDEN", "STUDENT"),
    getHostelById
);

// Update Hostel - Admin only
router.put(
    "/:id",
    protect,
    authorize("ADMIN"),
    updateHostel
);

// Delete Hostel - Admin only
router.delete(
    "/:id",
    protect,
    authorize("ADMIN"),
    deleteHostel
);

module.exports = router;