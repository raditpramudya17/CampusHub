/**
 * Skema validasi zod untuk modul achievement.
 */
import {z, ZodType} from "zod";

export class AchievementValidation {
    static readonly CREATE: ZodType = z.object({
        title: z.string().min(5, 'minimal 5 karakter').max(200, 'maksimal 200 karakter'),
        teamOrUser: z.string().min(3, 'minimal 3 karakter').max(200, 'maksimal 200 karakter'),
        rank: z.string().min(2, 'minimal 2 karakter').max(100, 'maksimal 100 karakter'),
        year: z.coerce.number().int().min(2000, 'tahun tidak valid').max(2100, 'tahun tidak valid'),
        prodi: z.string().min(2, 'minimal 2 karakter').max(100, 'maksimal 100 karakter'),
        proofUrl: z.url('link bukti tidak valid').optional(),
        repoUrl: z.url('link repo tidak valid').optional(),
        demoUrl: z.url('link demo tidak valid').optional()
    });

    static readonly REJECT: ZodType = z.object({
        rejectionReason: z.string().min(5, 'alasan minimal 5 karakter').max(500, 'alasan maksimal 500 karakter')
    });
}
