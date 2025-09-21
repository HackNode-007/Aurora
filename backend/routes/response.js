const express = require("express");
const responseRouter = express.Router();
const { responseModel, reportModel, userModel } = require("../db");
const mongoose = require("mongoose");

responseRouter.post("/", async (req, res) => {
    try {
        const { reportId, userId, response, imageUrls } = req.body;

        if (!reportId || !userId || !response || !imageUrls) {
            return res.status(400).json({
                success: false,
                message:
                    "Missing required fields: reportId, userId, response, imageUrls",
            });
        }

        if (
            !mongoose.Types.ObjectId.isValid(reportId) ||
            !mongoose.Types.ObjectId.isValid(userId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid reportId or userId format",
            });
        }

        const report = await reportModel.findById(reportId);
        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found",
            });
        }

        if (report.status === "resolved" || report.status === "rejected") {
            return res.status(400).json({
                success: false,
                message: "Cannot respond to a resolved or rejected report",
            });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const existingResponse = await responseModel.findOne({ reportId });
        if (existingResponse) {
            return res.status(400).json({
                success: false,
                message:
                    "This report already has a response. Only one response per report is allowed.",
            });
        }

        const newResponse = new responseModel({
            reportId,
            userId,
            response,
            imageUrls,
            status: "pending",
        });

        const savedResponse = await newResponse.save();

        await reportModel.findByIdAndUpdate(reportId, { status: "responded" });

        res.status(201).json({
            success: true,
            message: "Response submitted successfully",
            data: savedResponse,
        });
    } catch (error) {
        console.error("Error creating response:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});

responseRouter.get("/my/:userId", async (req, res) => {
    try {
        const userId = req.user.id;
        const { status } = req.query;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid userId format",
            });
        }

        let query = { userId };
        if (status && ["pending", "accepted", "rejected"].includes(status)) {
            query.status = status;
        }

        const responses = await responseModel
            .find(query)
            .populate({
                path: "reportId",
                select: "title description location urgency status reward reportedBy",
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Responses retrieved successfully",
            data: responses,
        });
    } catch (error) {
        console.error("Error fetching user responses:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});

// ✅ Todo PUT /responses/:responseId/status - Update response status (accept/reject)
responseRouter.put("/:responseId/status", async (req, res) => {
    try {
        const { responseId } = req.params;
        const { status, userId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(responseId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid responseId format",
            });
        }

        if (!status || !["accepted", "rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status must be either "accepted" or "rejected"',
            });
        }

        const response = await responseModel
            .findById(responseId)
            .populate("reportId");
        if (!response) {
            return res.status(404).json({
                success: false,
                message: "Response not found",
            });
        }

        if (response.reportId.reportedBy.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to update this response status",
            });
        }

        response.status = status;
        await response.save();

        if (status === "accepted") {
            await reportModel.findByIdAndUpdate(response.reportId._id, {
                status: "resolved",
                resolvedBy: response.userId,
                resolvedOnDate: new Date(),
            });
        } else if (status === "rejected") {
            await reportModel.findByIdAndUpdate(response.reportId._id, {
                status: "open",
            });
        }

        res.status(200).json({
            success: true,
            message: `Response ${status} successfully`,
            data: response,
        });
    } catch (error) {
        console.error("Error updating response status:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});

module.exports = responseRouter;
