/**
 * NotificationService — logika bisnis notifikasi in-app.
 * `create` juga dipanggil dari service lain (CompetitionService, ReminderService)
 * sebagai side-effect, bukan hanya lewat endpoint modul ini.
 */
import {Types} from "mongoose";
import NotificationModel from "../models/notification.model";
import {notificationResponse} from "../responses/notification.response";
import type {NotificationResponse, NotificationType} from "../../../types/notification.types";
import {Pageable} from "../../../types/common.types";

export class NotificationService {
    /** Dipanggil dari service lain untuk membuat notifikasi baru bagi satu user. */
    static async create(userId: Types.ObjectId | string, type: NotificationType, title: string, message: string, link: string | null = null): Promise<void> {
        await NotificationModel.create({user: userId, type, title, message, link});
    }

    /** Broadcast notifikasi "lomba baru di kategori favorit" ke banyak user sekaligus (dipakai saat lomba disetujui). */
    static async createMany(userIds: (Types.ObjectId | string)[], type: NotificationType, title: string, message: string, link: string | null = null): Promise<void> {
        if (userIds.length === 0) return;
        await NotificationModel.insertMany(userIds.map(userId => ({user: userId, type, title, message, link})));
    }

    static async getMine(userId: Types.ObjectId, page: number, size: number): Promise<Pageable<NotificationResponse> & {unreadCount: number}> {
        const skip = Math.max(0, (Number(page) - 1) * Number(size));
        const limit = Math.max(1, Number(size));

        const [total, unreadCount, notifications] = await Promise.all([
            NotificationModel.countDocuments({user: userId}),
            NotificationModel.countDocuments({user: userId, read: false}),
            NotificationModel.find({user: userId}).sort({createdAt: -1}).skip(skip).limit(limit)
        ]);

        return {
            data: notifications.map(notificationResponse),
            paging: {page, size, total},
            unreadCount
        };
    }

    static async markRead(id: string, userId: Types.ObjectId): Promise<void> {
        if (!Types.ObjectId.isValid(id)) return;
        await NotificationModel.updateOne({_id: id, user: userId}, {$set: {read: true}});
    }

    static async markAllRead(userId: Types.ObjectId): Promise<void> {
        await NotificationModel.updateMany({user: userId, read: false}, {$set: {read: true}});
    }
}
