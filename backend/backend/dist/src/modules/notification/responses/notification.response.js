"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationResponse = void 0;
const notificationResponse = (notification) => ({
    id: notification._id.toString(),
    type: notification.type,
    title: notification.title,
    message: notification.message,
    link: notification.link ?? null,
    read: notification.read,
    createdAt: notification.createdAt
});
exports.notificationResponse = notificationResponse;
