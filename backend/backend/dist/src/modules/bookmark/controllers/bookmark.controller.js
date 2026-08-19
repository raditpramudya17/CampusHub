"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookmarkController = void 0;
const bookmark_service_1 = require("../services/bookmark.service");
const api_response_1 = require("../../../utils/api-response");
class BookmarkController {
    /** POST /api/bookmarks/:competitionId — simpan lomba. */
    static async save(req, res, next) {
        await bookmark_service_1.BookmarkService.save(req.user._id, String(req.params.competitionId));
        return (0, api_response_1.success)(res, 200, 'Competition saved', null);
    }
    /** DELETE /api/bookmarks/:competitionId — hapus dari simpanan. */
    static async remove(req, res, next) {
        await bookmark_service_1.BookmarkService.remove(req.user._id, String(req.params.competitionId));
        return (0, api_response_1.success)(res, 200, 'Competition unsaved', null);
    }
    /** GET /api/bookmarks — daftar lomba yang disimpan user yang login. */
    static async getMine(req, res, next) {
        const response = await bookmark_service_1.BookmarkService.getMine(req.user._id);
        return (0, api_response_1.success)(res, 200, 'Saved competitions retrieved successfully', response);
    }
}
exports.BookmarkController = BookmarkController;
