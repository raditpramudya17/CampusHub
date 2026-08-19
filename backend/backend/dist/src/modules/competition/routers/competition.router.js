"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Router modul competition — mapping URL ke method CompetitionController.
 * Semua path relatif terhadap /api/competitions (di-mount di applications/web.ts).
 */
const express_1 = require("express");
const competition_controller_1 = require("../controllers/competition.controller");
const auth_middleware_1 = require("../../../middlewares/auth-middleware");
const rate_limit_middleware_1 = require("../../../middlewares/rate-limit-middleware");
const competitionRouter = (0, express_1.Router)();
// Unggah lomba wajib login; hasilnya berstatus pending sampai disetujui admin
competitionRouter.post('/', auth_middleware_1.authMiddleware, competition_controller_1.CompetitionController.create);
// Publik, tapi optionalAuthMiddleware perlu tahu siapa yang bertanya agar
// filter status=pending/rejected/all tidak membocorkan lomba orang lain
// (lihat CompetitionService.getAll). Rate-limited agar tidak jadi vektor scraping/abuse.
competitionRouter.get('/', rate_limit_middleware_1.publicReadRateLimit, auth_middleware_1.optionalAuthMiddleware, competition_controller_1.CompetitionController.getAll);
// Admin-only: moderasi, riwayat, statistik
competitionRouter.get('/audit', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, competition_controller_1.CompetitionController.audit);
competitionRouter.get('/stats', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, competition_controller_1.CompetitionController.stats);
competitionRouter.patch('/:id/approve', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, competition_controller_1.CompetitionController.approve);
competitionRouter.patch('/:id/reject', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, competition_controller_1.CompetitionController.reject);
// Hapus lomba: hanya dapat dilakukan oleh pemilik lomba atau admin
competitionRouter.delete('/:id', auth_middleware_1.authMiddleware, competition_controller_1.CompetitionController.delete);
exports.default = competitionRouter;
