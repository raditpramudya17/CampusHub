"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startReminderScheduler = startReminderScheduler;
/**
 * Scheduler cron untuk reminder deadline lomba tersimpan (H-7/H-3/H-1).
 * Dijadwalkan sekali sehari; logika pengecekan ada di ReminderService.
 */
const node_cron_1 = __importDefault(require("node-cron"));
const reminder_service_1 = require("../modules/notification/services/reminder.service");
const logging_1 = __importDefault(require("../applications/logging"));
/** Jam 07:00 waktu server, setiap hari. */
const SCHEDULE = '0 7 * * *';
function startReminderScheduler() {
    node_cron_1.default.schedule(SCHEDULE, async () => {
        try {
            await reminder_service_1.ReminderService.run();
        }
        catch (err) {
            logging_1.default.error(err, 'Reminder scheduler gagal berjalan');
        }
    });
    logging_1.default.info(`Reminder scheduler aktif (jadwal: "${SCHEDULE}")`);
}
