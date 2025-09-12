const express = require("express");
const userRouter = express.Router();
const reportRouter = require("./report");

userRouter.get("/getDetails", (req, res) => {
    res.json({ endpoint: "/user/getDetails", message: "Not completed yet" });
});

userRouter.delete("/delete", (req, res) => {
    res.json({ endpoint: "/user/delete", message: "Not completed yet" });
});

userRouter.put("/update", (req, res) => {
    res.json({ endpoint: "/user/update", message: "Not completed yet" });
});

userRouter.use("/report", reportRouter);

module.exports = userRouter;
