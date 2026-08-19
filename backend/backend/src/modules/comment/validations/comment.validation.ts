import {z, ZodType} from "zod";

export class CommentValidation {
    static readonly CREATE: ZodType = z.object({
        competitionId: z.string().min(1, 'competitionId wajib diisi'),
        text: z.string().min(2, 'minimal 2 karakter').max(1000, 'maksimal 1000 karakter')
    });
}
