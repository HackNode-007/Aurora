const express = require("express");
const reportRouter = express.Router();

reportRouter.get("/all", (req, res) => {
    res.json({ endpoint: "/user/report/all", message: "Not completed yet" });
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
