/**
 * Skema validasi zod untuk modul competition.
 */
import {z, ZodType} from "zod";

export class CompetitionValidation {
    /**
     * Body pembuatan lomba.
     * - Tanggal dikirim sebagai string ISO (mis. "2026-08-01") lalu di-coerce ke Date
     * - Deadline pendaftaran tidak boleh di masa lalu
     * - Field status/author dsb. TIDAK diterima dari input (diatur server)
     */
    static readonly CREATE: ZodType = z.object({
        title: z.string().min(5, 'minimal 5 karakter').max(200, 'maksimal 200 karakter'),
        description: z.string().min(20, 'minimal 20 karakter').max(5000, 'maksimal 5000 karakter'),
        category: z.enum(['akademik', 'teknologi', 'seni', 'olahraga', 'bisnis', 'lainnya'], 'kategori tidak valid'),
        organizer: z.string().min(3, 'minimal 3 karakter').max(200, 'maksimal 200 karakter'),
        registrationDeadline: z.coerce.date('tanggal tidak valid').refine(d => d.getTime() > Date.now(), {
            message: 'deadline pendaftaran tidak boleh di masa lalu'
        }),
        eventDate: z.coerce.date('tanggal tidak valid').optional(),
        prize: z.string().max(500, 'maksimal 500 karakter').optional(),
        requirements: z.string().max(2000, 'maksimal 2000 karakter').optional(),
        registrationLink: z.url('link tidak valid').optional(),
        posterUrl: z.url('link poster tidak valid').optional(),
        fee: z.enum(['gratis', 'berbayar'], 'biaya tidak valid').optional(),
        format: z.enum(['online', 'offline', 'hybrid'], 'format tidak valid').optional(),
        level: z.enum(['kampus', 'regional', 'nasional', 'internasional'], 'level tidak valid').optional(),
        tags: z.array(z.string().max(30, 'tag maksimal 30 karakter')).max(10, 'maksimal 10 tag').optional(),
        location: z.string().max(200, 'maksimal 200 karakter').optional()
    });

    /** Body penolakan lomba oleh admin — wajib menyertakan alasan. */
    static readonly REJECT: ZodType = z.object({
        rejectionReason: z.string().min(5, 'alasan minimal 5 karakter').max(500, 'alasan maksimal 500 karakter')
    });
}
