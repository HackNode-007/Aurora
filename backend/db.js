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
            unique: true,
        },
        location: {
            type: String,
            required: true,
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

const userModel = mongoose.model("users", users);
const reportModel = mongoose.model("reports", report);
const responseModel = mongoose.model("responses", response);
const upvoteModel = mongoose.model("upvotes", upvote);
const commentModel = mongoose.model("comments", comment);
module.exports = {
    userModel,
    reportModel,
    responseModel,
    upvoteModel,
    commentModel,
};
