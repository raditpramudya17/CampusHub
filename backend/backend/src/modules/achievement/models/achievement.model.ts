/**
 * Model Achievement — prestasi mahasiswa/tim yang dilaporkan untuk Wall of Fame.
 * Sama seperti Competition, dimoderasi admin sebelum tayang publik.
 */
import mongoose from "../../../../mongoose/config";
import {Schema} from "mongoose";
import type {AchievementTypes} from "../../../types/achievement.types";

const achievementSchema = new mongoose.Schema<AchievementTypes>({
    title: {
        type: String,
        required: true
    },
    teamOrUser: {
        type: String,
        required: true
    },
    rank: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    prodi: {
        type: String,
        required: true
    },
    proofUrl: {
        type: String,
        default: null
    },
    repoUrl: {
        type: String,
        default: null
    },
    demoUrl: {
        type: String,
        default: null
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    rejectionReason: {
        type: String,
        default: null
    },
    reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    reviewedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: {createdAt: true, updatedAt: false}
})

achievementSchema.index({status: 1, createdAt: -1});

const AchievementModel = mongoose.model("Achievement", achievementSchema);

export default AchievementModel;
