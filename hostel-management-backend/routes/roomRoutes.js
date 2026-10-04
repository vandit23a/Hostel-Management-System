const express = require("express");

const {
    createRoom,
    getAllRooms,
    getRoomById,
    getRoomsByHostel,
    searchRooms,
    updateRoom,
    deleteRoom
} = require("../controllers/roomController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// Create Room - Admin and Warden
router.post(
    "/",
    protect,
    authorize("ADMIN", "WARDEN"),
    createRoom
);

// Get All Rooms - Admin, Warden, Student
router.get(
    "/",
    protect,
    authorize("ADMIN", "WARDEN", "STUDENT"),
    getAllRooms
);

// Get Rooms By Hostel - Admin, Warden, Student
router.get(
    "/hostel/:hostelId",
    protect,
    authorize("ADMIN", "WARDEN", "STUDENT"),
    getRoomsByHostel
);

// Search Rooms By Room Number - Admin and Warden
router.get(
    "/search",
    protect,
    authorize("ADMIN", "WARDEN"),
    searchRooms
);  

// Get Room By ID - Admin, Warden, Student
router.get(
    "/:id",
    protect,
    authorize("ADMIN", "WARDEN", "STUDENT"),
    getRoomById
);

// Update Room - Admin and Warden
router.put(
    "/:id",
    protect,
    authorize("ADMIN", "WARDEN"),
    updateRoom
);

// Delete Room - Admin only
router.delete(
    "/:id",
    protect,
    authorize("ADMIN"),
    deleteRoom
);

module.exports = router;