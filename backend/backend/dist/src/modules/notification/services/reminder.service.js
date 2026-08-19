"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReminderService = void 0;
/**
 * ReminderService — cek lomba tersimpan (bookmark) yang mendekati deadline pendaftaran,
 * lalu kirim notifikasi in-app + email di ambang H-7/H-3/H-1 (sekali per ambang per bookmark,
 * dilacak lewat Bookmark.remindedThresholds agar tidak dikirim berulang).
 * Dipanggil setiap hari oleh jobs/reminder.scheduler.ts.
 */
const bookmark_model_1 = __importDefault(require("../../bookmark/models/bookmark.model"));
const notification_service_1 = require("./notification.service");
const nodemailer_1 = require("../../../utils/nodemailer");
const logging_1 = __importDefault(require("../../../applications/logging"));
const THRESHOLDS = [7, 3, 1];
const formatDateID = (date) => date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
class ReminderService {
    /** Jalankan pengecekan untuk semua ambang H- yang didukung. */
    static async run() {
        for (const threshold of THRESHOLDS) {
            await this.processThreshold(threshold);
        }
    }
    /**
     * Cari bookmark dengan lomba approved yang deadline-nya jatuh persis `threshold` hari
     * dari sekarang (dibulatkan ke hari kalender), dan belum pernah diberi tahu di ambang ini.
     */
    static async processThreshold(threshold) {
        const windowStart = new Date();
        windowStart.setHours(0, 0, 0, 0);
        windowStart.setDate(windowStart.getDate() + threshold);
        const windowEnd = new Date(windowStart);
        windowEnd.setDate(windowEnd.getDate() + 1);
        const bookmarks = await bookmark_model_1.default.find({ remindedThresholds: { $ne: threshold } })
            .populate({
            path: 'competition',
            match: { status: 'approved', registrationDeadline: { $gte: windowStart, $lt: windowEnd } },
            select: 'title registrationDeadline'
        })
            .populate('user', 'email firstName');
        const due = bookmarks.filter((b) => b.competition && b.user);
        if (due.length === 0)
            return;
        const dayLabel = threshold === 1 ? 'besok' : `${threshold} hari lagi`;
        for (const bookmark of due) {
            const competition = bookmark.competition;
            const user = bookmark.user;
            const deadlineLabel = formatDateID(competition.registrationDeadline);
            await notification_service_1.NotificationService.create(user._id, 'deadline_reminder', `Deadline lomba ${dayLabel}`, `Pendaftaran "${competition.title}" ditutup ${dayLabel} (${deadlineLabel}).`, `#/tersimpan`);
            if (user.email) {
                try {
                    await nodemailer_1.Nodemailer.sendDeadlineReminder(user.email, competition.title, threshold, deadlineLabel);
                }
                catch (err) {
                    logging_1.default.error(err, 'Gagal mengirim email reminder deadline');
                }
            }
            bookmark.remindedThresholds.push(threshold);
            await bookmark.save();
        }
    }
}
exports.ReminderService = ReminderService;
