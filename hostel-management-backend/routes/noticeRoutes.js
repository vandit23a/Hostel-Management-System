const express = require("express");

const {
    createNotice,
    getAllNotices,
    getNoticeById,
    updateNotice,
    deleteNotice
} = require("../controllers/noticeController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();


// Admin and Warden create notice
router.post(
    "/",
    protect,
    authorize("ADMIN", "WARDEN"),
    createNotice
);


// Admin, Warden and Student view all notices
router.get(
    "/",
    protect,
    authorize("ADMIN", "WARDEN", "STUDENT"),
    getAllNotices
);


// Admin, Warden and Student view notice by ID
router.get(
    "/:id",
    protect,
    authorize("ADMIN", "WARDEN", "STUDENT"),
    getNoticeById
);


// Admin and Warden update notice
router.put(
    "/:id",
    protect,
    authorize("ADMIN", "WARDEN"),
    updateNotice
);


// Only Admin deletes notice
router.delete(
    "/:id",
    protect,
    authorize("ADMIN"),
    deleteNotice
);


module.exports = router;