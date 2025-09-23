const express = require("express");
const { Connection, PublicKey, Keypair, Transaction, SystemProgram, sendAndConfirmTransaction } = require("@solana/web3.js");
const { userModel, transactionModel } = require("../db")
const { walletRouter } = require("./wallet")
const paymentRouter = express.Router();

const connection = new Connection(process.env.SOLANA_RPC_URL || "https://api.devnet-beta.solana.com");

const serverWallet = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(process.env.SOLANA_PRIVATE_KEY || "[]"))
);

const lamportsToSol = (lamports) => lamports / 1000000000;
const solToLamports = (sol) => Math.floor(sol * 1000000000);

const isValidSolanaAddress = (address) => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

paymentRouter.get("/balance", async (req, res) => {
  const { userId } = req.user;

  if (!userId) {
    return res.status(404).json({
      message: "userId not found",
    });
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "user not found",
      });
    }

    return res.status(200).json({
      message: "user balance fetched correctly",
      balance: parseFloat(user.balance.toString()),
      lockedBalance: parseFloat(user.lockedBalance.toString()),
      availableBalance: parseFloat(user.balance.toString()) - parseFloat(user.lockedBalance.toString())
    });
  } catch (e) {
    return res.status(500).json({
      message: "Server error please try again later",
      error: e.message,
    });
  }
});

paymentRouter.get("/payout", async (req, res) => {
  const { userId } = req.user;

  if (!userId) {
    return res.status(404).json({
      message: "userId not found",
    });
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.walletAddress) {
      return res.status(400).json({
        message: "Wallet address not set. Please update your profile.",
      });
    }

    if (!isValidSolanaAddress(user.walletAddress)) {
      return res.status(400).json({
        message: "Invalid Solana wallet address",
      });
    }

    const availableBalance = parseFloat(user.balance.toString()) - parseFloat(user.lockedBalance.toString());

    if (availableBalance <= 0) {
      return res.status(400).json({
        message: "Insufficient balance for payout",
        availableBalance: availableBalance
      });
    }

    const pendingPayout = await transactionModel.findOne({
      userId: userId,
      type: 'payout',
      status: 'pending'
    });

    if (pendingPayout) {
      return res.status(400).json({
        message: "You already have a pending payout request",
        transactionId: pendingPayout._id
      });
    }

    const session = await userModel.startSession();
    session.startTransaction();

    try {
      await userModel.findByIdAndUpdate(
        userId,
        { $inc: { lockedBalance: availableBalance } },
        { session }
      );

      const transaction = new transactionModel({
        userId: userId,
        type: 'payout',
        amount: availableBalance,
        status: 'pending',
        fromAddress: serverWallet.publicKey.toString(),
        toAddress: user.walletAddress,
        metadata: {
          initiatedAt: new Date(),
          userBalance: parseFloat(user.balance.toString()),
          userLockedBalance: parseFloat(user.lockedBalance.toString())
        }
      });

      const savedTransaction = await transaction.save({ session });

      await session.commitTransaction();

      processPayoutAsync(savedTransaction._id, userId, availableBalance, user.walletAddress);

      return res.status(200).json({
        message: "Payout initiated successfully",
        transactionId: savedTransaction._id,
        amount: availableBalance,
        status: "pending"
      });

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

  } catch (e) {
    return res.status(500).json({
      message: "Server error please try again later",
      error: e.message,
    });
  }
});

async function processPayoutAsync(transactionId, userId, amount, toAddress) {
  try {
    const lamports = solToLamports(amount);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: serverWallet.publicKey,
        toPubkey: new PublicKey(toAddress),
        lamports: lamports,
      })
    );

    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [serverWallet]
    );

    await transactionModel.findByIdAndUpdate(transactionId, {
      status: 'completed',
      txHash: signature,
      completedAt: new Date(),
      metadata: {
        signature: signature,
        lamports: lamports,
        completedAt: new Date()
      }
    });

    await userModel.findByIdAndUpdate(userId, {
      $inc: {
        balance: -amount,
        lockedBalance: -amount
      }
    });

  } catch (error) {
    console.error('Payout failed:', error);

    await transactionModel.findByIdAndUpdate(transactionId, {
      status: 'failed',
      failedAt: new Date(),
      error: error.message,
      metadata: {
        error: error.message,
        failedAt: new Date()
      }
    });

    await userModel.findByIdAndUpdate(userId, {
      $inc: { lockedBalance: -amount }
    });
  }
}

paymentRouter.post("/donate", async (req, res) => {
  const { userId } = req.user;
  const { toUserId, amount, message } = req.body;

  if (!userId) {
    return res.status(404).json({
      message: "userId not found",
    });
  }

  if (!toUserId || !amount || amount <= 0) {
    return res.status(400).json({
      message: "Invalid donation parameters",
    });
  }

  try {
    const fromUser = await userModel.findById(userId);
    const toUser = await userModel.findById(toUserId);

    if (!fromUser || !toUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const availableBalance = parseFloat(fromUser.balance.toString()) - parseFloat(fromUser.lockedBalance.toString());

    if (availableBalance < amount) {
      return res.status(400).json({
        message: "Insufficient balance for donation",
        availableBalance: availableBalance,
        requestedAmount: amount
      });
    }

    const session = await userModel.startSession();
    session.startTransaction();

    try {
      await userModel.findByIdAndUpdate(
        userId,
        { $inc: { balance: -amount } },
        { session }
      );

      await userModel.findByIdAndUpdate(
        toUserId,
        { $inc: { balance: amount } },
        { session }
      );

      const donationTransaction = new transactionModel({
        userId: userId,
        type: 'donation_sent',
        amount: amount,
        status: 'completed',
        fromAddress: userId,
        toAddress: toUserId,
        completedAt: new Date(),
        metadata: {
          message: message,
          recipientUsername: toUser.username,
          completedAt: new Date()
        }
      });

      const receivedTransaction = new transactionModel({
        userId: toUserId,
        type: 'donation_received',
        amount: amount,
        status: 'completed',
        fromAddress: userId,
        toAddress: toUserId,
        completedAt: new Date(),
        metadata: {
          message: message,
          senderUsername: fromUser.username,
          completedAt: new Date()
        }
      });

      await donationTransaction.save({ session });
      await receivedTransaction.save({ session });

      await session.commitTransaction();

      return res.status(200).json({
        message: "Donation completed successfully",
        amount: amount,
        from: fromUser.username,
        to: toUser.username,
        transactionId: donationTransaction._id
      });

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

  } catch (e) {
    return res.status(500).json({
      message: "Server error please try again later",
      error: e.message,
    });
  }
});

paymentRouter.get("/transactions", async (req, res) => {
  const { userId } = req.user;
  // const { page = 1, limit = 20, type } = req.query;

  if (!userId) {
    return res.status(404).json({
      message: "userId not found",
    });
  }

  try {
    const query = { userId };

    const transactions = await transactionModel
      .find(query)
      .sort({ createdAt: -1 })
      // .limit(limit * 1)
      // .skip((page - 1) * limit)
      // .exec();

    const total = await transactionModel.countDocuments(query);

    return res.status(200).json({
      message: "Transactions fetched successfully",
      transactions,
      // totalPages: Math.ceil(total / limit),
      // currentPage: page,
      // total
    });

  } catch (e) {
    return res.status(500).json({
      message: "Server error please try again later",
      error: e.message,
    });
  }
});

paymentRouter.use("/wallet", walletRouter)

module.exports = {
  paymentRouter,
};
