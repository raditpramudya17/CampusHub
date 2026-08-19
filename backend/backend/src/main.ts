/**
 * Entry point aplikasi.
 * Memuat variabel .env, lalu menjalankan server Express.
 */
import "dotenv/config";
import web from "./applications/web";
import logger from "./applications/logging";
import {startReminderScheduler} from "./jobs/reminder.scheduler";
import {ensureBucket} from "./utils/minio";

// Port diambil dari .env, fallback ke 3000 jika tidak diset
const PORT = Number(process.env.PORT) || 3000;

web.listen(PORT, () => {
    logger.info(`Listen on http://localhost:${PORT}`);
    startReminderScheduler();
    ensureBucket().catch((err) => logger.error(err, 'Gagal menyiapkan bucket MinIO'));
})
