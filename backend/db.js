const {Schema, default: mongoose} = require("mongoose")
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
            default: null,
        },
        balance: {
            type: Number,
            default: 0,
            min: 0,
        },
        lockedBalance: {
            type: Number,
            default: 0,
            min: 0,
        },
        profileCompleted: {type: Boolean,
        default: false}
    },
    { timestamps: true }
)
const userModel = mongoose.model('users',users)
module.exports = {
    userModel
}
