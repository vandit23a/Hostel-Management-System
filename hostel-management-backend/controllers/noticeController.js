const Notice = require("../models/Notice");

// Create Notice
const createNotice = async (req, res) => {
    try {
        const {
            title,
            content,
            targetAudience,
            isPublished,
            publishDate,
            expiryDate
        } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: "Title and content are required"
            });
        }

        const notice = await Notice.create({
            title,
            content,
            publishedBy: req.user._id,
            targetAudience: targetAudience || "ALL",
            isPublished:
                isPublished !== undefined
                    ? isPublished
                    : true,
            publishDate: publishDate || new Date(),
            expiryDate: expiryDate || null
        });

        const populatedNotice = await Notice.findById(
            notice._id
        ).populate(
            "publishedBy",
            "name email role"
        );

        res.status(201).json({
            success: true,
            message: "Notice created successfully",
            notice: populatedNotice
        });

    } catch (error) {
        console.error(
            "Create notice error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Get All Notices
const getAllNotices = async (req, res) => {
    try {
        const notices = await Notice.find()
            .populate(
                "publishedBy",
                "name email role"
            )
            .sort({ publishDate: -1 });

        res.status(200).json({
            success: true,
            count: notices.length,
            notices
        });

    } catch (error) {
        console.error(
            "Get notices error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Get Notice By ID
const getNoticeById = async (req, res) => {
    try {
        const notice = await Notice.findById(
            req.params.id
        ).populate(
            "publishedBy",
            "name email role"
        );

        if (!notice) {
            return res.status(404).json({
                success: false,
                message: "Notice not found"
            });
        }

        res.status(200).json({
            success: true,
            notice
        });

    } catch (error) {
        console.error(
            "Get notice error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Update Notice
const updateNotice = async (req, res) => {
    try {
        const notice = await Notice.findById(
            req.params.id
        );

        if (!notice) {
            return res.status(404).json({
                success: false,
                message: "Notice not found"
            });
        }

        const {
            title,
            content,
            targetAudience,
            isPublished,
            publishDate,
            expiryDate
        } = req.body;

        if (title !== undefined) {
            notice.title = title;
        }

        if (content !== undefined) {
            notice.content = content;
        }

        if (targetAudience !== undefined) {
            const allowedAudiences = [
                "ALL",
                "STUDENT",
                "WARDEN"
            ];

            if (!allowedAudiences.includes(targetAudience)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid target audience"
                });
            }

            notice.targetAudience = targetAudience;
        }

        if (isPublished !== undefined) {
            notice.isPublished = isPublished;
        }

        if (publishDate !== undefined) {
            notice.publishDate = publishDate;
        }

        if (expiryDate !== undefined) {
            notice.expiryDate = expiryDate;
        }

        await notice.save();

        const updatedNotice = await Notice.findById(
            notice._id
        ).populate(
            "publishedBy",
            "name email role"
        );

        res.status(200).json({
            success: true,
            message: "Notice updated successfully",
            notice: updatedNotice
        });

    } catch (error) {
        console.error(
            "Update notice error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Delete Notice
const deleteNotice = async (req, res) => {
    try {
        const notice = await Notice.findById(
            req.params.id
        );

        if (!notice) {
            return res.status(404).json({
                success: false,
                message: "Notice not found"
            });
        }

        await Notice.findByIdAndDelete(
            req.params.id
        );

        res.status(200).json({
            success: true,
            message: "Notice deleted successfully"
        });

    } catch (error) {
        console.error(
            "Delete notice error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


module.exports = {
    createNotice,
    getAllNotices,
    getNoticeById,
    updateNotice,
    deleteNotice
};