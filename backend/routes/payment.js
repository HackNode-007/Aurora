const express = require("express");
const paymentRouter = express.Router();

paymentRouter.get("/balance", (req, res) => {
  const { userId } = req.user;
  if (!userId) {
    return res.status(404).json({
      message: "userId not found",
    });
  }
  try {
    const user = userModel.findById(userId);
    if (!user) {
      return res.status(405).json({
        message: "user not found",
      });
    }
    return res.status(200).json({
      message: "user balance fetched correctly",
      balance: user.balance,
    });
  } catch (e) {
    return res.status(500).json({
      message: "Server error please try again later",
      error: e.message,
    });
  }
});

//Todo
paymentRouter.post("/payout", (req, res) => {
  return res.send({
    message: "Not completed yet",
  });
});

paymentRouter.post("/donate", (req, res) => {
  return res.send({
    message: "Not completed yet",
  });
});

module.exports = {
  paymentRouter,
};
