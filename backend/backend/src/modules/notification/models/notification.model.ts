/**
 * Model Notification — notifikasi in-app per user (lonceng di header).
 * Dibuat dari beberapa sumber: perubahan status moderasi (approve/reject),
 * reminder deadline lomba tersimpan (lihat ReminderService), dan lomba baru
 * di kategori yang pernah di-bookmark user.
 */
import mongoose from "../../../../mongoose/config";
import {Schema} from "mongoose";
import type {NotificationTypes} from "../../../types/notification.types";

const notificationSchema = new mongoose.Schema<NotificationTypes>({
    user: {
        type: Schema.Types.ObjectId,
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
    timestamps: {createdAt: true, updatedAt: false}
})

// Index untuk query kotak masuk: notifikasi milik user, terbaru dulu
notificationSchema.index({user: 1, createdAt: -1});

const NotificationModel = mongoose.model("Notification", notificationSchema);

export default NotificationModel;
