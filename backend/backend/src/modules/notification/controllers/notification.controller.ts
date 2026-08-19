/**
 * NotificationController — lapisan HTTP modul notification.
 * Semua route wajib login (lihat notification.router.ts) — notifikasi selalu milik req.user sendiri.
 */
import type {NextFunction, Response} from "express";
import type {UserRequest} from "../../../types/user.types";
import {NotificationService} from "../services/notification.service";
import {success} from "../../../utils/api-response";

export class NotificationController {
    /** GET /api/notifications — kotak masuk milik user yang login, plus unreadCount. */
    static async getMine(req: UserRequest, res: Response, next: NextFunction): Promise<Response> {
        let page = parseInt(String(req.query.page ?? '1'), 10);
        let size = parseInt(String(req.query.size ?? '20'), 10);
        if (!Number.isFinite(page) || page < 1) page = 1;
        if (!Number.isFinite(size) || size < 1) size = 20;
        size = Math.min(Math.max(size, 1), 100);

        const response = await NotificationService.getMine(req.user!._id, page, size);
        return success(res, 200, 'Notifications retrieved successfully', response);
    }

    /** PATCH /api/notifications/:id/read — tandai satu notifikasi sudah dibaca. */
    static async markRead(req: UserRequest, res: Response, next: NextFunction): Promise<Response> {
        await NotificationService.markRead(String(req.params.id), req.user!._id);
        return success(res, 200, 'Notification marked as read', {id: req.params.id});
    }

    /** PATCH /api/notifications/read-all — tandai semua notifikasi milik user sudah dibaca. */
    static async markAllRead(req: UserRequest, res: Response, next: NextFunction): Promise<Response> {
        await NotificationService.markAllRead(req.user!._id);
        return success(res, 200, 'All notifications marked as read', null);
    }
}
