const express = require("express");

const {
    createComplaint,
    getAllComplaints,
    getComplaintById,
    getMyComplaints,
    updateComplaintStatus,
    deleteComplaint
} = require("../controllers/complaintController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// Student creates complaint
router.post(
    "/",
    protect,
    authorize("STUDENT"),
    createComplaint
);

// Admin and Warden view all complaints
router.get(
    "/",
    protect,
    authorize("ADMIN", "WARDEN"),
    getAllComplaints
);

// Student views own complaints
router.get(
    "/my",
    protect,
    authorize("STUDENT"),
    getMyComplaints
);

// Admin, Warden and Student view complaint by ID
router.get(
    "/:id",
    protect,
    authorize("ADMIN", "WARDEN", "STUDENT"),
    getComplaintById
);

// Admin and Warden update complaint
router.put(
    "/:id/status",
    protect,
    authorize("ADMIN", "WARDEN"),
    updateComplaintStatus
);

// Admin deletes complaint
router.delete(
    "/:id",
    protect,
    authorize("ADMIN"),
    deleteComplaint
);

module.exports = router;