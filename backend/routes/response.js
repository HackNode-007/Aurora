const express = require("express");
const responseRouter = express.Router();
const { responseModel, reportModel, userModel } = require("../db");
const mongoose = require("mongoose");
const {
    createResponseSchema
} = require("../utils/ZodObjects")

responseRouter.post("/", async (req, res) => {
    try {
        const validationResult = createResponseSchema.safeParse(req.body);

        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validationResult.error.issues.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message
                }))
            });
        }

        const { reportId, userId, response, imageUrls } = validationResult.data;

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
                message: "This report already has a response. Only one response per report is allowed.",
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

responseRouter.get("/my", async (req, res) => {
    try {
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid userId format",
            });
        }

        let query = { userId };

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

module.exports = responseRouter;