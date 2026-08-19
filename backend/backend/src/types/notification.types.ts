/**
 * Tipe-tipe yang berkaitan dengan notifikasi in-app.
 */
import {Types} from "mongoose";

export type NotificationType = 'submission_approved' | 'submission_rejected' | 'deadline_reminder' | 'new_in_category';

/** Bentuk dokumen Notification di database. */
export interface NotificationTypes {
    _id: Types.ObjectId;
    user: Types.ObjectId;
    type: NotificationType;
    title: string;
    message: string;
    link: string | null;
    read: boolean;
    createdAt: Date;
}

/** Bentuk response notification yang dikirim ke client. */
export interface NotificationResponse {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    link: string | null;
    read: boolean;
    createdAt: Date;
}
