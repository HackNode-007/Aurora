const express = require("express");
const reportRouter = express.Router();

reportRouter.get("/all", async (req, res) => {
    const userId = req.user.userId;
    if (!userId) {
        return res.status(404).json({ message: "userId not found" });
    }
    try{
        const reports = await reportModel.find({
            status: "open"
        })
        reports.sort((a, b) => b.createdAt - a.createdAt)

        const finalReports = reports.map(report => 
                this.report.title,
                this.report.description,
                this.report.labels,
                this.report.location,
                this.report.imageUrls,
                this.report.urgency,
                this.report.status,
                this.report.createdAt,
                this.report.reward,
                this.report.upvotes,
                upvoted= await upvoteModel.findOne({reportId: this.report._id, userId: userId}) ? true : false    
        )                                                        
        if(!reports || reports.length === 0){
            return res.status(404).json({
                message: "No reports found"
            })
        }
        return res.status(200).json({
            message: "Reports fetched successfully",
            reports: finalReports
        })
    }catch(e){
        return res.status(500).json({
            message: "Server error please try again later",
            error: e.message
        })
    }
});

reportRouter.post("/create", (req, res) => {
    res.json({ endpoint: "/user/report/create", message: "Not completed yet" });
});

reportRouter.get("/myReports", (req, res) => {
    res.json({ endpoint: "/user/report/myReports", message: "Not completed yet" });
});

reportRouter.delete("/deleteReport", (req, res) => {
    res.json({ endpoint: "/user/report/deleteReport", message: "Not completed yet" });
});

reportRouter.put("/updateReport", (req, res) => {
    res.json({ endpoint: "/user/report/updateReport", message: "Not completed yet" });
});

reportRouter.get("/search", (req, res) => {
    res.json({ endpoint: "/user/report/search", message: "Not completed yet" });
});

module.exports = reportRouter;
