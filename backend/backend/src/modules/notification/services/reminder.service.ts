/**
 * ReminderService — cek lomba tersimpan (bookmark) yang mendekati deadline pendaftaran,
 * lalu kirim notifikasi in-app + email di ambang H-7/H-3/H-1 (sekali per ambang per bookmark,
 * dilacak lewat Bookmark.remindedThresholds agar tidak dikirim berulang).
 * Dipanggil setiap hari oleh jobs/reminder.scheduler.ts.
 */
import BookmarkModel from "../../bookmark/models/bookmark.model";
import {NotificationService} from "./notification.service";
import {Nodemailer} from "../../../utils/nodemailer";
import logger from "../../../applications/logging";

const THRESHOLDS = [7, 3, 1] as const;

const formatDateID = (date: Date): string =>
    date.toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'});

export class ReminderService {
    /** Jalankan pengecekan untuk semua ambang H- yang didukung. */
    static async run(): Promise<void> {
        for (const threshold of THRESHOLDS) {
            await this.processThreshold(threshold);
        }
    }

    /**
     * Cari bookmark dengan lomba approved yang deadline-nya jatuh persis `threshold` hari
     * dari sekarang (dibulatkan ke hari kalender), dan belum pernah diberi tahu di ambang ini.
     */
    private static async processThreshold(threshold: number): Promise<void> {
        const windowStart = new Date();
        windowStart.setHours(0, 0, 0, 0);
        windowStart.setDate(windowStart.getDate() + threshold);
        const windowEnd = new Date(windowStart);
        windowEnd.setDate(windowEnd.getDate() + 1);

        const bookmarks = await BookmarkModel.find({remindedThresholds: {$ne: threshold}})
            .populate({
                path: 'competition',
                match: {status: 'approved', registrationDeadline: {$gte: windowStart, $lt: windowEnd}},
                select: 'title registrationDeadline'
            })
            .populate('user', 'email firstName');

        const due = bookmarks.filter((b: any) => b.competition && b.user);
        if (due.length === 0) return;

        const dayLabel = threshold === 1 ? 'besok' : `${threshold} hari lagi`;

        for (const bookmark of due) {
            const competition: any = bookmark.competition;
            const user: any = bookmark.user;
            const deadlineLabel = formatDateID(competition.registrationDeadline);

            await NotificationService.create(
                user._id,
                'deadline_reminder',
                `Deadline lomba ${dayLabel}`,
                `Pendaftaran "${competition.title}" ditutup ${dayLabel} (${deadlineLabel}).`,
                `#/tersimpan`
            );

            if (user.email) {
                try {
                    await Nodemailer.sendDeadlineReminder(user.email, competition.title, threshold, deadlineLabel);
                } catch (err) {
                    logger.error(err, 'Gagal mengirim email reminder deadline');
                }
            }

            bookmark.remindedThresholds.push(threshold);
            await bookmark.save();
        }
    }
}
