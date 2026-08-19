"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookmarkService = void 0;
/**
 * BookmarkService — logika bisnis fitur simpan lomba (Lomba Tersimpan).
 */
const mongoose_1 = require("mongoose");
const bookmark_model_1 = __importDefault(require("../models/bookmark.model"));
const competition_model_1 = __importDefault(require("../../competition/models/competition.model"));
const competition_response_1 = require("../../competition/responses/competition.response");
const response_error_1 = require("../../../errors/response-error");
class BookmarkService {
    /** Simpan lomba. Idempoten — memanggil dua kali tidak error/duplikat. */
    static async save(userId, competitionId) {
        if (!mongoose_1.Types.ObjectId.isValid(competitionId)) {
            throw new response_error_1.ResponseError(404, 'Competition not found');
        }
        const competition = await competition_model_1.default.findById(competitionId);
        if (!competition) {
            throw new response_error_1.ResponseError(404, 'Competition not found');
        }
        await bookmark_model_1.default.updateOne({ user: userId, competition: competitionId }, { $setOnInsert: { user: userId, competition: competitionId } }, { upsert: true });
    }
    /** Hapus simpanan. Idempoten — aman dipanggil walau belum/tidak pernah tersimpan. */
    static async remove(userId, competitionId) {
        await bookmark_model_1.default.deleteOne({ user: userId, competition: competitionId });
    }
    /** Ambil semua lomba yang disimpan user, urut dari yang terbaru disimpan. */
    static async getMine(userId) {
        const bookmarks = await bookmark_model_1.default.find({ user: userId })
            .sort({ createdAt: -1 })
            .populate({
            path: 'competition',
            populate: { path: 'author', select: 'username email' }
        });
        return bookmarks
            .filter((b) => b.competition) // lewati jika lomba yang disimpan sudah dihapus
            .map((b) => (0, competition_response_1.competitionResponse)(b.competition));
    }
}
exports.BookmarkService = BookmarkService;
