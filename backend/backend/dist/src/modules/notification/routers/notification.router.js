"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Router modul notification — mapping URL ke method NotificationController.
 * Path relatif terhadap /api/notifications (di-mount di applications/web.ts).
 * Seluruh endpoint wajib login (notifikasi selalu milik diri sendiri).
 */
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const auth_middleware_1 = require("../../../middlewares/auth-middleware");
const notificationRouter = (0, express_1.Router)();
notificationRouter.get('/', auth_middleware_1.authMiddleware, notification_controller_1.NotificationController.getMine);
notificationRouter.patch('/read-all', auth_middleware_1.authMiddleware, notification_controller_1.NotificationController.markAllRead);
notificationRouter.patch('/:id/read', auth_middleware_1.authMiddleware, notification_controller_1.NotificationController.markRead);
exports.default = notificationRouter;
