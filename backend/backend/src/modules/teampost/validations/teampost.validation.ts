import {z, ZodType} from "zod";

export class TeamPostValidation {
    static readonly CREATE: ZodType = z.object({
        competition: z.string().optional(),
        title: z.string().min(5, 'minimal 5 karakter').max(150, 'maksimal 150 karakter'),
        description: z.string().min(10, 'minimal 10 karakter').max(1000, 'maksimal 1000 karakter'),
        rolesNeeded: z.string().min(2, 'minimal 2 karakter').max(200, 'maksimal 200 karakter'),
        contactInfo: z.string().min(3, 'minimal 3 karakter').max(200, 'maksimal 200 karakter')
    });

    static readonly VOTE: ZodType = z.object({
        value: z.union([z.literal(1), z.literal(-1)], 'value harus 1 (naik) atau -1 (turun)')
    });

    static readonly COMMENT_CREATE: ZodType = z.object({
        text: z.string().min(2, 'minimal 2 karakter').max(1000, 'maksimal 1000 karakter')
    });
}
