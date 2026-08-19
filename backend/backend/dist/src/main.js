"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Entry point aplikasi.
 * Memuat variabel .env, lalu menjalankan server Express.
 */
require("dotenv/config");
const web_1 = __importDefault(require("./applications/web"));
const logging_1 = __importDefault(require("./applications/logging"));
const reminder_scheduler_1 = require("./jobs/reminder.scheduler");
const minio_1 = require("./utils/minio");
// Port diambil dari .env, fallback ke 3000 jika tidak diset
const PORT = Number(process.env.PORT) || 3000;
web_1.default.listen(PORT, () => {
    logging_1.default.info(`Listen on http://localhost:${PORT}`);
    (0, reminder_scheduler_1.startReminderScheduler)();
    (0, minio_1.ensureBucket)().catch((err) => logging_1.default.error(err, 'Gagal menyiapkan bucket MinIO'));
});
