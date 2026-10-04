const express = require("express");

const {
    createAllocation,
    getAllAllocations,
    getAllocationById,
    getAllocationsByStudent,
    getActiveAllocationByStudent,
    getMyAllocation,
    changeRoomAllocation,
    vacateAllocation
} = require("../controllers/allocationController");

const { protect } = require("../middleware/authMiddleware");

const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();


// =====================================================
// CREATE ALLOCATION
// =====================================================

// Admin and Warden

router.post(
    "/",
    protect,
    authorize("ADMIN", "WARDEN"),
    createAllocation
);


// =====================================================
// GET ALL ALLOCATIONS
// =====================================================

// Admin and Warden

router.get(
    "/",
    protect,
    authorize("ADMIN", "WARDEN"),
    getAllAllocations
);


// =====================================================
// GET ALLOCATIONS BY STUDENT
// =====================================================

// Admin, Warden and Student

router.get(
    "/my",
    protect,
    authorize("STUDENT"),
    getMyAllocation
);

router.get(
    "/student/:studentId",
    protect,
    authorize("ADMIN", "WARDEN", "STUDENT"),
    getAllocationsByStudent
);


// =====================================================
// GET ACTIVE ALLOCATION BY STUDENT
// =====================================================

// Admin, Warden and Student

router.get(
    "/student/:studentId/active",
    protect,
    authorize("ADMIN", "WARDEN", "STUDENT"),
    getActiveAllocationByStudent
);



// =====================================================
// CHANGE ROOM
// =====================================================

// Admin and Warden

router.put(
    "/:id/change-room",
    protect,
    authorize("ADMIN", "WARDEN"),
    changeRoomAllocation
);


// =====================================================
// VACATE ALLOCATION
// =====================================================

// Admin and Warden

router.put(
    "/:id/vacate",
    protect,
    authorize("ADMIN", "WARDEN"),
    vacateAllocation
);


// =====================================================
// GET ALLOCATION BY ID
// =====================================================

// Admin and Warden

router.get(
    "/:id",
    protect,
    authorize("ADMIN", "WARDEN"),
    getAllocationById
);


module.exports = router;