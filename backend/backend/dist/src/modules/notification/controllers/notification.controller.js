"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notification_service_1 = require("../services/notification.service");
const api_response_1 = require("../../../utils/api-response");
class NotificationController {
    /** GET /api/notifications — kotak masuk milik user yang login, plus unreadCount. */
    static async getMine(req, res, next) {
        let page = parseInt(String(req.query.page ?? '1'), 10);
        let size = parseInt(String(req.query.size ?? '20'), 10);
        if (!Number.isFinite(page) || page < 1)
            page = 1;
        if (!Number.isFinite(size) || size < 1)
            size = 20;
        size = Math.min(Math.max(size, 1), 100);
        const response = await notification_service_1.NotificationService.getMine(req.user._id, page, size);
        return (0, api_response_1.success)(res, 200, 'Notifications retrieved successfully', response);
    }
    /** PATCH /api/notifications/:id/read — tandai satu notifikasi sudah dibaca. */
    static async markRead(req, res, next) {
        await notification_service_1.NotificationService.markRead(String(req.params.id), req.user._id);
        return (0, api_response_1.success)(res, 200, 'Notification marked as read', { id: req.params.id });
    }
    /** PATCH /api/notifications/read-all — tandai semua notifikasi milik user sudah dibaca. */
    static async markAllRead(req, res, next) {
        await notification_service_1.NotificationService.markAllRead(req.user._id);
        return (0, api_response_1.success)(res, 200, 'All notifications marked as read', null);
    }
}
exports.NotificationController = NotificationController;
