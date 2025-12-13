import mongoose from "mongoose";


const logSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        default: 'info'
    },
    message: {
        type: String,
        required: true
    },
    ip: {
        type: String
    },
    route: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    meta: {
        type: mongoose.Schema.Types.Mixed,
    }
}, { timestamps: true });


export const Log = mongoose.model('Log', logSchema);