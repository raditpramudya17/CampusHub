"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
/**
 * NotificationService — logika bisnis notifikasi in-app.
 * `create` juga dipanggil dari service lain (CompetitionService, ReminderService)
 * sebagai side-effect, bukan hanya lewat endpoint modul ini.
 */
const mongoose_1 = require("mongoose");
const notification_model_1 = __importDefault(require("../models/notification.model"));
const notification_response_1 = require("../responses/notification.response");
class NotificationService {
    /** Dipanggil dari service lain untuk membuat notifikasi baru bagi satu user. */
    static async create(userId, type, title, message, link = null) {
        await notification_model_1.default.create({ user: userId, type, title, message, link });
    }
    /** Broadcast notifikasi "lomba baru di kategori favorit" ke banyak user sekaligus (dipakai saat lomba disetujui). */
    static async createMany(userIds, type, title, message, link = null) {
        if (userIds.length === 0)
            return;
        await notification_model_1.default.insertMany(userIds.map(userId => ({ user: userId, type, title, message, link })));
    }
    static async getMine(userId, page, size) {
        const skip = Math.max(0, (Number(page) - 1) * Number(size));
        const limit = Math.max(1, Number(size));
        const [total, unreadCount, notifications] = await Promise.all([
            notification_model_1.default.countDocuments({ user: userId }),
            notification_model_1.default.countDocuments({ user: userId, read: false }),
            notification_model_1.default.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit)
        ]);
        return {
            data: notifications.map(notification_response_1.notificationResponse),
            paging: { page, size, total },
            unreadCount
        };
    }
    static async markRead(id, userId) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            return;
        await notification_model_1.default.updateOne({ _id: id, user: userId }, { $set: { read: true } });
    }
    static async markAllRead(userId) {
        await notification_model_1.default.updateMany({ user: userId, read: false }, { $set: { read: true } });
    }
}
exports.NotificationService = NotificationService;
