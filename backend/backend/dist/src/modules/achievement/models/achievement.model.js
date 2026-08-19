"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Model Achievement — prestasi mahasiswa/tim yang dilaporkan untuk Wall of Fame.
 * Sama seperti Competition, dimoderasi admin sebelum tayang publik.
 */
const config_1 = __importDefault(require("../../../../mongoose/config"));
const mongoose_1 = require("mongoose");
const achievementSchema = new config_1.default.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    reviewedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: { createdAt: true, updatedAt: false }
});
achievementSchema.index({ status: 1, createdAt: -1 });
const AchievementModel = config_1.default.model("Achievement", achievementSchema);
exports.default = AchievementModel;
