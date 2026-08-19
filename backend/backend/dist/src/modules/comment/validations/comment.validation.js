"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentValidation = void 0;
const zod_1 = require("zod");
class CommentValidation {
    static CREATE = zod_1.z.object({
        competitionId: zod_1.z.string().min(1, 'competitionId wajib diisi'),
        text: zod_1.z.string().min(2, 'minimal 2 karakter').max(1000, 'maksimal 1000 karakter')
    });
}
exports.CommentValidation = CommentValidation;
