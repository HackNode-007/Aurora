const {Router} = require("express");
const {userModel, transactionModel} = require("../db");
const {PublicKey} = require("@solana/web3.js");
const walletRouter = new Router();

walletRouter.post("/generate-message", async (req, res) => {
  const { userId } = req.user;
  const { walletAddress } = req.body;

  if (!userId) {
    return res.status(404).json({
      message: "userId not found",
    });
  }

  if (!walletAddress) {
    return res.status(400).json({
      message: "Wallet address is required",
    });
  }

  if (!isValidSolanaAddress(walletAddress)) {
    return res.status(400).json({
      message: "Invalid Solana wallet address",
    });
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const timestamp = Date.now();
    const nonce = Math.random().toString(36).substring(2, 15);
    const message = `Connect wallet to ${process.env.APP_NAME || 'Your App'}\n\nWallet: ${walletAddress}\nUser: ${user.username}\nTimestamp: ${timestamp}\nNonce: ${nonce}\n\nThis request will not trigger any blockchain transaction or cost any gas fees.`;

    const verificationData = {
      userId,
      walletAddress,
      message,
      timestamp,
      nonce,
      expiresAt: timestamp + (5 * 60 * 1000)
    };

    await userModel.findByIdAndUpdate(userId, {
      $set: {
        pendingWalletVerification: verificationData
      }
    });

    return res.status(200).json({
      message: "Verification message generated successfully",
      verificationMessage: message,
      walletAddress,
      expiresAt: verificationData.expiresAt
    });

  } catch (e) {
    return res.status(500).json({
      message: "Server error please try again later",
      error: e.message,
    });
  }
});

walletRouter.post("/verify-signature", async (req, res) => {
  const { userId } = req.user;
  const { walletAddress, signature, message } = req.body;

  if (!userId) {
    return res.status(404).json({
      message: "userId not found",
    });
  }

  if (!walletAddress || !signature || !message) {
    return res.status(400).json({
      message: "Wallet address, signature, and message are required",
    });
  }

  if (!isValidSolanaAddress(walletAddress)) {
    return res.status(400).json({
      message: "Invalid Solana wallet address",
    });
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const pendingVerification = user.pendingWalletVerification;

    if (!pendingVerification) {
      return res.status(400).json({
        message: "No pending wallet verification found. Please generate a new message.",
      });
    }

    if (Date.now() > pendingVerification.expiresAt) {
      return res.status(400).json({
        message: "Verification message has expired. Please generate a new message.",
      });
    }

    if (message !== pendingVerification.message) {
      return res.status(400).json({
        message: "Message mismatch. Please use the generated message.",
      });
    }

    if (walletAddress !== pendingVerification.walletAddress) {
      return res.status(400).json({
        message: "Wallet address mismatch.",
      });
    }

    try {
      const { verify } = require('@noble/ed25519');
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = new Uint8Array(Buffer.from(signature, 'base64'));
      const publicKeyBytes = new PublicKey(walletAddress).toBytes();

      const isValid = await verify(signatureBytes, messageBytes, publicKeyBytes);

      if (!isValid) {
        return res.status(400).json({
          message: "Invalid signature. Please sign the message with your wallet.",
        });
      }
    } catch (signatureError) {
      return res.status(400).json({
        message: "Failed to verify signature. Please try again.",
        error: signatureError.message
      });
    }

    const existingUser = await userModel.findOne({ 
      walletAddress: walletAddress,
      _id: { $ne: userId }
    });

    if (existingUser) {
      return res.status(400).json({
        message: "This wallet is already connected to another account.",
      });
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { 
        walletAddress: walletAddress,
        walletVerified: true,
        walletConnectedAt: new Date(),
        $unset: { pendingWalletVerification: 1 }
      },
      { new: true }
    );

    const walletConnectionTransaction = new transactionModel({
      userId: userId,
      type: 'wallet_connected',
      amount: 0,
      status: 'completed',
      fromAddress: walletAddress,
      toAddress: userId,
      completedAt: new Date(),
      metadata: {
        walletAddress: walletAddress,
        verificationMethod: 'signature',
        connectedAt: new Date(),
        userAgent: req.get('User-Agent') || 'Unknown'
      }
    });

    await walletConnectionTransaction.save();

    return res.status(200).json({
      message: "Wallet connected and verified successfully",
      walletAddress: updatedUser.walletAddress,
      walletVerified: true,
      connectedAt: updatedUser.walletConnectedAt
    });

  } catch (e) {
    return res.status(500).json({
      message: "Server error please try again later",
      error: e.message,
    });
  }
});

walletRouter.get("/status", async (req, res) => {
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

    const hasWallet = !!user.walletAddress;
    const isVerified = !!user.walletVerified;

    return res.status(200).json({
      message: "Wallet status retrieved successfully",
      hasWallet,
      isVerified,
      walletAddress: user.walletAddress || null,
      connectedAt: user.walletConnectedAt || null,
      hasPendingVerification: !!user.pendingWalletVerification
    });

  } catch (e) {
    return res.status(500).json({
      message: "Server error please try again later",
      error: e.message,
    });
  }
});

walletRouter.post("/disconnect", async (req, res) => {
  const { userId } = req.user;
  const { confirmDisconnect } = req.body;

  if (!userId) {
    return res.status(404).json({
      message: "userId not found",
    });
  }

  if (!confirmDisconnect) {
    return res.status(400).json({
      message: "Please confirm wallet disconnection",
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
        message: "No wallet connected to disconnect",
      });
    }

    const pendingTransactions = await transactionModel.findOne({
      userId: userId,
      status: { $in: ['pending', 'processing'] }
    });

    if (pendingTransactions) {
      return res.status(400).json({
        message: "Cannot disconnect wallet while you have pending transactions",
      });
    }

    const oldWalletAddress = user.walletAddress;

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { 
        $unset: { 
          walletAddress: 1,
          walletVerified: 1,
          walletConnectedAt: 1,
          pendingWalletVerification: 1
        }
      },
      { new: true }
    );

    const walletDisconnectionTransaction = new transactionModel({
      userId: userId,
      type: 'wallet_disconnected',
      amount: 0,
      status: 'completed',
      fromAddress: oldWalletAddress,
      toAddress: userId,
      completedAt: new Date(),
      metadata: {
        previousWalletAddress: oldWalletAddress,
        disconnectedAt: new Date(),
        userAgent: req.get('User-Agent') || 'Unknown'
      }
    });

    await walletDisconnectionTransaction.save();

    return res.status(200).json({
      message: "Wallet disconnected successfully",
      previousWalletAddress: oldWalletAddress
    });

  } catch (e) {
    return res.status(500).json({
      message: "Server error please try again later",
      error: e.message,
    });
  }
});

module.exports = {
  walletRouter,
};