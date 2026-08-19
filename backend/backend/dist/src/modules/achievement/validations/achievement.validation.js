"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AchievementValidation = void 0;
/**
 * Skema validasi zod untuk modul achievement.
 */
const zod_1 = require("zod");
class AchievementValidation {
    static CREATE = zod_1.z.object({
        title: zod_1.z.string().min(5, 'minimal 5 karakter').max(200, 'maksimal 200 karakter'),
        teamOrUser: zod_1.z.string().min(3, 'minimal 3 karakter').max(200, 'maksimal 200 karakter'),
        rank: zod_1.z.string().min(2, 'minimal 2 karakter').max(100, 'maksimal 100 karakter'),
        year: zod_1.z.coerce.number().int().min(2000, 'tahun tidak valid').max(2100, 'tahun tidak valid'),
        prodi: zod_1.z.string().min(2, 'minimal 2 karakter').max(100, 'maksimal 100 karakter'),
        proofUrl: zod_1.z.url('link bukti tidak valid').optional(),
        repoUrl: zod_1.z.url('link repo tidak valid').optional(),
        demoUrl: zod_1.z.url('link demo tidak valid').optional()
    });
    static REJECT = zod_1.z.object({
        rejectionReason: zod_1.z.string().min(5, 'alasan minimal 5 karakter').max(500, 'alasan maksimal 500 karakter')
    });
}
exports.AchievementValidation = AchievementValidation;
