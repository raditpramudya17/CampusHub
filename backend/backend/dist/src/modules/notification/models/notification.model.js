"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Model Notification — notifikasi in-app per user (lonceng di header).
 * Dibuat dari beberapa sumber: perubahan status moderasi (approve/reject),
 * reminder deadline lomba tersimpan (lihat ReminderService), dan lomba baru
 * di kategori yang pernah di-bookmark user.
 */
const config_1 = __importDefault(require("../../../../mongoose/config"));
const mongoose_1 = require("mongoose");
const notificationSchema = new config_1.default.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ["submission_approved", "submission_rejected", "deadline_reminder", "new_in_category"],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    link: {
        type: String,
        default: null
    },
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: { createdAt: true, updatedAt: false }
});
// Index untuk query kotak masuk: notifikasi milik user, terbaru dulu
notificationSchema.index({ user: 1, createdAt: -1 });
const NotificationModel = config_1.default.model("Notification", notificationSchema);
exports.default = NotificationModel;
