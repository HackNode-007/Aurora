const express = require("express");
const { z } = require("zod");
const {
    reportModel,
    upvoteModel,
    commentModel,
    responseModel,
} = require("../db");
const { createReportSchema } = require("../utils/ZodObjects");
const responseRouter = require("./response");
const reportRouter = express.Router();

reportRouter.get("/all", async (req, res) => {
    const userId = req.user.userId;
    if (!userId) {
        return res.status(404).json({ message: "userId not found" });
    }
    try {
        const reports = await reportModel.find({
            status: "open",
        });

        reports.sort((a, b) => b.createdAt - a.createdAt);

        const finalReports = await Promise.all(
            reports.map(async (report) => {
                const upvoted = (await upvoteModel.findOne({
                    reportId: report._id,
                    userId: userId,
                }))
                    ? true
                    : false;

                return {
                    title: report.title,
                    description: report.description,
                    labels: report.labels,
                    location: report.location,
                    imageUrls: report.imageUrls,
                    urgency: report.urgency,
                    status: report.status,
                    createdAt: report.createdAt,
                    reward: report.reward,
                    upvotes: report.upvotes,
                    upvoted: upvoted,
                };
            }),
        );

        if (!reports || reports.length === 0) {
            return res.status(404).json({
                message: "No reports found",
            });
        }

        return res.status(200).json({
            message: "Reports fetched successfully",
            reports: finalReports,
        });
    } catch (e) {
        return res.status(500).json({
            message: "Server error please try again later",
            error: e.message,
        });
    }
});

reportRouter.post("/create", async (req, res) => {
    const userId = req.user.userId;

    if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    try {
        const validatedData = createReportSchema.parse(req.body);

        const newReport = new reportModel({
            title: validatedData.title,
            description: validatedData.description,
            labels: validatedData.labels,
            location: validatedData.location,
            imageUrls: validatedData.imageUrls,
            urgency: validatedData.urgency,
            reportedBy: userId,
            reward: validatedData.reward || null,
            status: "pending",
        });

        const savedReport = await newReport.save();

        return res.status(201).json({
            message: "Report created successfully",
            report: {
                id: savedReport._id,
                title: savedReport.title,
                description: savedReport.description,
                labels: savedReport.labels,
                location: savedReport.location,
                imageUrls: savedReport.imageUrls,
                urgency: savedReport.urgency,
                status: savedReport.status,
                reward: savedReport.reward,
                createdAt: savedReport.createdAt,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            const validationErrors = error.errors.map((err) => ({
                field: err.path.join("."),
                message: err.message,
            }));

            return res.status(400).json({
                message: "Validation failed",
                errors: validationErrors,
            });
        }

        return res.status(500).json({
            message: "Server error please try again later",
            error: error.message,
        });
    }
});

reportRouter.get("/myReports", async (req, res) => {
    const userId = req.user.userId;

    if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    try {

        const reports = await reportModel.find({
            reportedBy: userId
        }).sort({ createdAt: -1 });

        const formattedReports = await Promise.all(
            reports.map(async (report) => {
                const upvoteCount = await upvoteModel.countDocuments({
                    reportId: report._id,
                });
                const responseCount = await responseModel.countDocuments({
                    reportId: report._id,
                });
                const commentCount = await commentModel.countDocuments({
                    reportId: report._id,
                });

                return {
                    id: report._id,
                    title: report.title,
                    description: report.description,
                    labels: report.labels,
                    location: report.location,
                    imageUrls: report.imageUrls,
                    urgency: report.urgency,
                    status: report.status,
                    reward: report.reward,
                    upvotes: upvoteCount,
                    responses: responseCount,
                    comments: commentCount,
                    createdAt: report.createdAt,
                    updatedAt: report.updatedAt,
                    resolvedBy: report.resolvedBy,
                    resolvedOnDate: report.resolvedOnDate,
                };
            }),
        );

        if (reports.length === 0) {
            return res.status(200).json({
                message: "No reports found",
                reports: [],
            });
        }

        return res.status(200).json({
            message: "Reports fetched successfully",
            reports: formattedReports,
        });
    } catch (e) {
        return res.status(500).json({
            message: "Server error please try again later",
            error: e.message,
        });
    }
});

reportRouter.delete("/deleteReport/:id", async (req, res) => {
    const userId = req.user.userId;
    const reportId = req.params.id;

    if (!userId) {
        return res.status(404).json({ message: "userId not found" });
    }

    if (!reportId) {
        return res.status(400).json({ message: "Report ID is required" });
    }

    try {
        const report = await reportModel.findById(reportId);

        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        if (report.reportedBy.toString() !== userId.toString()) {
            return res
                .status(403)
                .json({
                    message: "You are not authorized to delete this report",
                });
        }

        if (report.status !== "pending") {
            return res.status(400).json({
                message: "Cannot delete report as our service has undertaken this report for validation",
            });
        }

        await reportModel.findByIdAndDelete(reportId);

        await upvoteModel.deleteMany({ reportId: reportId });
        await commentModel.deleteMany({ reportId: reportId });
        await responseModel.deleteMany({ reportId: reportId });

        return res.status(200).json({
            message: "Report deleted successfully",
        });
    } catch (e) {
        return res.status(500).json({
            message: "Server error please try again later",
            error: e.message,
        });
    }
});

reportRouter.use("/response", responseRouter);

reportRouter.post("/:id/upvote", async (req, res) => {
    const userId = req.user.userId;
    const reportId = req.params.id;

    if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
    }

    if (!reportId) {
        return res.status(400).json({ message: "Report ID is required" });
    }

    try {
        const report = await reportModel.findById(reportId);
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        const existingUpvote = await upvoteModel.findOne({
            reportId: reportId,
            userId: userId
        });

        let upvoted;
        let newUpvoteCount;

        if (existingUpvote) {
            await upvoteModel.findByIdAndDelete(existingUpvote._id);
            await reportModel.findByIdAndUpdate(reportId, { $inc: { upvotes: -1 } });

            upvoted = false;
            newUpvoteCount = report.upvotes - 1;
        } else {
            const newUpvote = new upvoteModel({ reportId, userId });
            await newUpvote.save();
            await reportModel.findByIdAndUpdate(reportId, { $inc: { upvotes: 1 } });

            upvoted = true;
            newUpvoteCount = report.upvotes + 1;
        }

        return res.status(200).json({
            message: upvoted ? "Report upvoted successfully" : "Upvote removed successfully",
            upvoted,
            upvotes: newUpvoteCount
        });

    } catch (error) {
        console.error("Upvote error:", error);
        return res.status(500).json({
            message: "Server error occurred while processing upvote",
            error: error.message
        });
    }
});

reportRouter.post("/:id/comment", async (req, res) => {
    const userId = req.user.userId;
    const reportId = req.params.id;
    const { comment } = req.body;

    if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
    }

    if (!reportId) {
        return res.status(400).json({ message: "Report ID is required" });
    }

    if (!comment || comment.trim().length === 0) {
        return res.status(400).json({ message: "Comment cannot be empty" });
    }

    if (comment.length > 500) {
        return res.status(400).json({ message: "Comment exceeds maximum length of 500 characters" });
    }

    try {
        const report = await reportModel.findById(reportId);
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        const newComment = new commentModel({
            reportId,
            userId,
            comment: comment.trim()
        });

        const savedComment = await newComment.save();

        return res.status(201).json({
            message: "Comment added successfully",
            comment: {
                id: savedComment._id,
                comment: savedComment.comment,
                userId: savedComment.userId,
                dateRecorded: savedComment.dateRecorded,
                isReplied: savedComment.isReplied
            }
        });

    } catch (error) {
        console.error("Comment creation error:", error);
        return res.status(500).json({
            message: "Server error occurred while adding comment",
            error: error.message
        });
    }
});

reportRouter.get("/:id/comments", async (req, res) => {
    const reportId = req.params.id;

    if (!reportId) {
        return res.status(400).json({ message: "Report ID is required" });
    }

    try {
        const report = await reportModel.findById(reportId);
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        const comments = await commentModel.find({ reportId })
            .populate('userId', 'username')
            .populate('replyUserId', 'username')
            .sort({ dateRecorded: 1 });

        const formattedComments = comments.map(comment => ({
            id: comment._id,
            userId: comment.userId._id,
            username: comment.userId.username,
            comment: comment.comment,
            dateRecorded: comment.dateRecorded,
            isReplied: comment.isReplied,
            reply: comment.reply,
            replyUserId: comment.replyUserId?._id || null,
            replyUsername: comment.replyUserId?.username || null
        }));

        return res.status(200).json({
            message: "Comments retrieved successfully",
            comments: formattedComments,
            count: formattedComments.length
        });

    } catch (error) {
        console.error("Comments retrieval error:", error);
        return res.status(500).json({
            message: "Server error occurred while retrieving comments",
            error: error.message
        });
    }
});

reportRouter.post("/comment/reply", async (req, res) => {
    const userId = req.user.userId;
    const commentId = req.body.commentId;
    const {reply} = req.body;

    if (!userId) {
        return res.status(401).json({message: "User not authenticated"});
    }

    if (!commentId) {
        return res.status(400).json({message: "Comment ID is required"});
    }

    if (!reply || reply.trim() === "") {
        return res.status(400).json({message: "Reply is required"});
    }

    try {
        const comment = await commentModel.findById(commentId);
        if (!comment) {
            return res.status(404).json({message: "Comment not found"});
        }

        if (comment.isReplied) {
            return res.status(400).json({
                message: "This comment already has a reply. You can edit the existing reply instead."
            });
        }

        //Todo

        return res.json({
            message: "successfully added comment",
            reply
        })
    } catch (e) {
        console.error("reply error:", e);
        return res.status(500).json({
            message: "Server error occurred while saving reply",
            error: e.message
        });
    }
});

module.exports = reportRouter;
