/**
 * Scheduler cron untuk reminder deadline lomba tersimpan (H-7/H-3/H-1).
 * Dijadwalkan sekali sehari; logika pengecekan ada di ReminderService.
 */
import cron from "node-cron";
import {ReminderService} from "../modules/notification/services/reminder.service";
import logger from "../applications/logging";

/** Jam 07:00 waktu server, setiap hari. */
const SCHEDULE = '0 7 * * *';

export function startReminderScheduler(): void {
    cron.schedule(SCHEDULE, async () => {
        try {
            await ReminderService.run();
        } catch (err) {
            logger.error(err, 'Reminder scheduler gagal berjalan');
        }
    });
    logger.info(`Reminder scheduler aktif (jadwal: "${SCHEDULE}")`);
}
