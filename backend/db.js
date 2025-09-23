const { Schema, default: mongoose } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const users = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            unique: true,
        },
        walletAddress: {
            type: String,
            unique: false,
            sparse: true,
        },
        walletVerified: {
            type: Boolean,
            default: false,
        },
        walletConnectedAt: {
            type: Date,
            required: false,
        },
        pendingWalletVerification: {
            type: Schema.Types.Mixed,
            required: false,
        },
        pendingMessageSigning: {
            type: Schema.Types.Mixed,
            required: false,
        },
        location: {
            type: String,
            required: false,//Todo: change this to true after testing
            default: null,
        },
        balance: {
            type: Schema.Types.Decimal128,
            default: 0.0,
            min: 0.0,
        },
        lockedBalance: {
            type: Schema.Types.Decimal128,
            default: 0.0,
            min: 0.0,
        },
        profileCompleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);

const report = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    labels: {
        type: [String],
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    imageUrls: {
        type: [String],
        required: true,
    },
    urgency: {
        type: String,
        required: true,
        enum: ["low", "medium", "high", "critical"],
    },
    status: {
        type: String,
        enum: [
            "pending",
            "accepted",
            "open",
            "responded",
            "resolved",
            "rejected",
        ],
        default: "pending",
    },
    reportedBy: {
        type: ObjectId,
        required: true,
    },
    resolvedBy: {
        type: ObjectId,
        default: null,
    },
    resolvedOnDate: {
        type: Date,
    },
    reward: {
        type: Schema.Types.Decimal128,
    },
    upvotes: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

const upvote = new Schema({
    reportId: {
        type: ObjectId,
        required: true,
    },
    userId: {
        type: ObjectId,
        required: true,
    },
}, {
    timestamps: true,
});

const comment = new Schema({
    reportId: {
        type: ObjectId,
        required: true,
    },
    userId: {
        type: ObjectId,
        required: true,
    },
    comment: {
        type: String,
        required: true,
    },
    dateRecorded: {
        type: Date,
        default: Date.now,
    },
    isReplied: {
        type: Boolean,
        default: false,
    },
    reply: {
        type: String,
        default: null,
    },
    replyUserId: {
        type: ObjectId,
        default: null,
    },
}, {
    timestamps: true,
});

const response = new Schema(
    {
        reportId: {
            type: ObjectId,
            required: true,
        },
        userId: {
            type: ObjectId,
            required: true,
        },
        response: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected"],
            default: "pending",
        },
        imageUrls: {
            type: [String],
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

const transaction = new Schema(
    {
        userId: {
            type: ObjectId,
            required: true,
            ref: 'users'
        },
        type: {
            type: String,
            required: true,
            enum: [
                'payout',
                'donation_sent',
                'donation_received',
                'reward_received',
                'penalty_deducted',
                'bonus_added',
                'refund',
                'wallet_connected',
                'wallet_disconnected',
                'message_signed'
            ]
        },
        amount: {
            type: Schema.Types.Decimal128,
            required: true,
            min: 0
        },
        status: {
            type: String,
            required: true,
            enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
            default: 'pending'
        },
        fromAddress: {
            type: String,
            required: false
        },
        toAddress: {
            type: String,
            required: false
        },
        txHash: {
            type: String,
            unique: true,
            sparse: true
        },
        blockNumber: {
            type: Number,
            required: false
        },
        gasUsed: {
            type: Number,
            required: false
        },
        gasPrice: {
            type: Schema.Types.Decimal128,
            required: false
        },
        error: {
            type: String,
            required: false
        },
        retryCount: {
            type: Number,
            default: 0
        },
        maxRetries: {
            type: Number,
            default: 3
        },

        initiatedAt: {
            type: Date,
            default: Date.now
        },
        processedAt: {
            type: Date,
            required: false
        },
        completedAt: {
            type: Date,
            required: false
        },
        failedAt: {
            type: Date,
            required: false
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: {}
        },
        relatedReportId: {
            type: ObjectId,
            ref: 'reports',
            required: false
        },
        relatedResponseId: {
            type: ObjectId,
            ref: 'responses',
            required: false
        }
    },
    {
        timestamps: true,
    }
);

const userModel = mongoose.model("users", users);
const reportModel = mongoose.model("reports", report);
const responseModel = mongoose.model("responses", response);
const upvoteModel = mongoose.model("upvotes", upvote);
const commentModel = mongoose.model("comments", comment);
const transactionModel = mongoose.model("transactions", transaction);

module.exports = {
    userModel,
    reportModel,
    responseModel,
    upvoteModel,
    commentModel,
    transactionModel,
};
