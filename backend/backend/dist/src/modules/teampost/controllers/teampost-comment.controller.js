"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamPostCommentController = void 0;
const teampost_comment_service_1 = require("../services/teampost-comment.service");
const api_response_1 = require("../../../utils/api-response");
const user_model_1 = __importDefault(require("../../user/models/user.model"));
class TeamPostCommentController {
    /** GET /api/teamposts/:id/comments */
    static async getByTeamPost(req, res, next) {
        let page = parseInt(String(req.query.page ?? '1'), 10);
        let size = parseInt(String(req.query.size ?? '50'), 10);
        if (!Number.isFinite(page) || page < 1)
            page = 1;
        if (!Number.isFinite(size) || size < 1)
            size = 50;
        size = Math.min(Math.max(size, 1), 100);
        const response = await teampost_comment_service_1.TeamPostCommentService.getByTeamPost(String(req.params.id), page, size);
        return (0, api_response_1.success)(res, 200, 'Comments retrieved successfully', response);
    }
    /** POST /api/teamposts/:id/comments */
    static async create(req, res, next) {
        const { text } = req.body;
        const response = await teampost_comment_service_1.TeamPostCommentService.create(req.user._id, String(req.params.id), text);
        return (0, api_response_1.success)(res, 201, 'Comment posted successfully', response);
    }
    /** DELETE /api/teamposts/comments/:commentId */
    static async remove(req, res, next) {
        const user = await user_model_1.default.findById(req.user._id);
        const role = user ? user.role : 'mahasiswa';
        await teampost_comment_service_1.TeamPostCommentService.remove(String(req.params.commentId), req.user._id, role);
        return (0, api_response_1.success)(res, 200, 'Comment deleted successfully', { id: req.params.commentId });
    }
}
exports.TeamPostCommentController = TeamPostCommentController;
