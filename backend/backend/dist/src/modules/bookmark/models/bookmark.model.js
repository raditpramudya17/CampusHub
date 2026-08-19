"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Model Bookmark — penanda "lomba disimpan" oleh user (fitur Lomba Tersimpan).
 */
const config_1 = __importDefault(require("../../../../mongoose/config"));
const mongoose_1 = require("mongoose");
const bookmarkSchema = new config_1.default.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    competition: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Competition',
        required: true
    },
    // Ambang H- (7/3/1) yang sudah dikirim reminder-nya, agar tidak dikirim berulang (lihat ReminderService)
    remindedThresholds: {
        type: [Number],
        default: []
    }
}, {
    timestamps: { createdAt: true, updatedAt: false }
});
// Satu user hanya bisa menyimpan satu lomba sekali (dipakai juga untuk upsert idempoten di service)
bookmarkSchema.index({ user: 1, competition: 1 }, { unique: true });
const BookmarkModel = config_1.default.model("Bookmark", bookmarkSchema);
exports.default = BookmarkModel;
