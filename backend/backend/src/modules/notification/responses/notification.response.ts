/**
 * Fungsi pembentuk response modul notification.
 */
import type {NotificationResponse, NotificationTypes} from "../../../types/notification.types";

export const notificationResponse = (notification: NotificationTypes): NotificationResponse => ({
    id: notification._id.toString(),
    type: notification.type,
    title: notification.title,
    message: notification.message,
    link: notification.link ?? null,
    read: notification.read,
    createdAt: notification.createdAt
});
