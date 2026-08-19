"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamPostValidation = void 0;
const zod_1 = require("zod");
class TeamPostValidation {
    static CREATE = zod_1.z.object({
        competition: zod_1.z.string().optional(),
        title: zod_1.z.string().min(5, 'minimal 5 karakter').max(150, 'maksimal 150 karakter'),
        description: zod_1.z.string().min(10, 'minimal 10 karakter').max(1000, 'maksimal 1000 karakter'),
        rolesNeeded: zod_1.z.string().min(2, 'minimal 2 karakter').max(200, 'maksimal 200 karakter'),
        contactInfo: zod_1.z.string().min(3, 'minimal 3 karakter').max(200, 'maksimal 200 karakter')
    });
    static VOTE = zod_1.z.object({
        value: zod_1.z.union([zod_1.z.literal(1), zod_1.z.literal(-1)], 'value harus 1 (naik) atau -1 (turun)')
    });
    static COMMENT_CREATE = zod_1.z.object({
        text: zod_1.z.string().min(2, 'minimal 2 karakter').max(1000, 'maksimal 1000 karakter')
    });
}
exports.TeamPostValidation = TeamPostValidation;
