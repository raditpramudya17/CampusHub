/**
 * Router modul competition — mapping URL ke method CompetitionController.
 * Semua path relatif terhadap /api/competitions (di-mount di applications/web.ts).
 */
import {Router} from "express";
import {CompetitionController} from "../controllers/competition.controller";
import {adminMiddleware, authMiddleware, optionalAuthMiddleware} from "../../../middlewares/auth-middleware";
import {publicReadRateLimit} from "../../../middlewares/rate-limit-middleware";

const competitionRouter: Router = Router();

// Unggah lomba wajib login; hasilnya berstatus pending sampai disetujui admin
competitionRouter.post('/', authMiddleware, CompetitionController.create);
// Publik, tapi optionalAuthMiddleware perlu tahu siapa yang bertanya agar
// filter status=pending/rejected/all tidak membocorkan lomba orang lain
// (lihat CompetitionService.getAll). Rate-limited agar tidak jadi vektor scraping/abuse.
competitionRouter.get('/', publicReadRateLimit, optionalAuthMiddleware, CompetitionController.getAll);

// Admin-only: moderasi, riwayat, statistik
competitionRouter.get('/audit', authMiddleware, adminMiddleware, CompetitionController.audit);
competitionRouter.get('/stats', authMiddleware, adminMiddleware, CompetitionController.stats);
competitionRouter.patch('/:id/approve', authMiddleware, adminMiddleware, CompetitionController.approve);
competitionRouter.patch('/:id/reject', authMiddleware, adminMiddleware, CompetitionController.reject);

// Hapus lomba: hanya dapat dilakukan oleh pemilik lomba atau admin
competitionRouter.delete('/:id', authMiddleware, CompetitionController.delete);

export default competitionRouter;
