"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompetitionValidation = void 0;
/**
 * Skema validasi zod untuk modul competition.
 */
const zod_1 = require("zod");
class CompetitionValidation {
    /**
     * Body pembuatan lomba.
     * - Tanggal dikirim sebagai string ISO (mis. "2026-08-01") lalu di-coerce ke Date
     * - Deadline pendaftaran tidak boleh di masa lalu
     * - Field status/author dsb. TIDAK diterima dari input (diatur server)
     */
    static CREATE = zod_1.z.object({
        title: zod_1.z.string().min(5, 'minimal 5 karakter').max(200, 'maksimal 200 karakter'),
        description: zod_1.z.string().min(20, 'minimal 20 karakter').max(5000, 'maksimal 5000 karakter'),
        category: zod_1.z.enum(['akademik', 'teknologi', 'seni', 'olahraga', 'bisnis', 'lainnya'], 'kategori tidak valid'),
        organizer: zod_1.z.string().min(3, 'minimal 3 karakter').max(200, 'maksimal 200 karakter'),
        registrationDeadline: zod_1.z.coerce.date('tanggal tidak valid').refine(d => d.getTime() > Date.now(), {
            message: 'deadline pendaftaran tidak boleh di masa lalu'
        }),
        eventDate: zod_1.z.coerce.date('tanggal tidak valid').optional(),
        prize: zod_1.z.string().max(500, 'maksimal 500 karakter').optional(),
        requirements: zod_1.z.string().max(2000, 'maksimal 2000 karakter').optional(),
        registrationLink: zod_1.z.url('link tidak valid').optional(),
        posterUrl: zod_1.z.url('link poster tidak valid').optional(),
        fee: zod_1.z.enum(['gratis', 'berbayar'], 'biaya tidak valid').optional(),
        format: zod_1.z.enum(['online', 'offline', 'hybrid'], 'format tidak valid').optional(),
        level: zod_1.z.enum(['kampus', 'regional', 'nasional', 'internasional'], 'level tidak valid').optional(),
        tags: zod_1.z.array(zod_1.z.string().max(30, 'tag maksimal 30 karakter')).max(10, 'maksimal 10 tag').optional(),
        location: zod_1.z.string().max(200, 'maksimal 200 karakter').optional()
    });
    /** Body penolakan lomba oleh admin — wajib menyertakan alasan. */
    static REJECT = zod_1.z.object({
        rejectionReason: zod_1.z.string().min(5, 'alasan minimal 5 karakter').max(500, 'alasan maksimal 500 karakter')
    });
}
exports.CompetitionValidation = CompetitionValidation;
