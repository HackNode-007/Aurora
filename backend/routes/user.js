const express = require("express");
const userRouter = express.Router();
const reportRouter = require("./report");
const { userModel } = require("../db");
const { paymentRouter } = require("./payment");

userRouter.get("/getDetails", async (req, res) => {
    const { userId } = req.user;
    if (!userId) {
        return res.status(404).json({
            messgae: "userId not found",
        });
    }
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(405).json({
                messgae: "user not found",
            });
        }

        return res.status(200).json({
            message: "user details fetched correctly",
            userDetails: {
                email: user.email,
                username: user.username,
                phone: user.phone,
                location: user.location,
                walletAddress: user.walletAddress,
            },
        });
    } catch (e) {
        return res.status(500).json({
            messgae: "Server error plesae try again later",
            error: e.message,
        });
    }
});

userRouter.delete("/delete", async (req, res) => {
    const { userId } = req.user;
    if (!userId) {
        return res.status(404).json({
            messgae: "userId not found",
        });
    }
    try {
        const user = await userModel.findByIdAndDelete(userId);
        if (!user) {
            return res.status(405).json({
                messgae: "user not found",
            });
        }

        return res.status(200).json({
            message: `user deleted successfully with userId: ${userId}`,
        });
    } catch (e) {
        return res.status(500).json({
            messgae: "Server error plesae try again later",
            error: e.message,
        });
    }
});

userRouter.put("/update", async (req, res) => {
    const { walletAddress, location } = req.body;
    const { userId } = req.user;

    try {
        await updateUserObject.parseAsync({ walletAddress, location });

        const updateField = walletAddress ? { walletAddress } : { location };

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { $set: updateField },
            { new: true },
        );

        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return res.status(200).json({
            message: "User updated successfully",
            data: updatedUser,
        });
    } catch (e) {
        if (e instanceof z.ZodError) {
            return res.status(400).json({
                message: "Invalid input format",
                error: e.errors,
            });
        }

        return res.status(500).json({
            message: "Server error",
            error: e.message,
        });
    }
});

userRouter.use("/report", reportRouter);
userRouter.use("/payment", paymentRouter);

module.exports = userRouter;
