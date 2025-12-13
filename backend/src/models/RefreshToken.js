import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true
    },
    revoked: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        required: true
    },
}, { timestamps: true });

export const RefreshToken = mongoose.model('RefreshToken', tokenSchema);