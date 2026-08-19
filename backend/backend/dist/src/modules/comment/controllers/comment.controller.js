"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentController = void 0;
const comment_service_1 = require("../services/comment.service");
const api_response_1 = require("../../../utils/api-response");
const response_error_1 = require("../../../errors/response-error");
const user_model_1 = __importDefault(require("../../user/models/user.model"));
class CommentController {
    static async create(req, res, next) {
        const { competitionId, text } = req.body;
        const response = await comment_service_1.CommentService.create(req.user._id, competitionId, text);
        return (0, api_response_1.success)(res, 201, 'Comment posted successfully', response);
    }
    static async getByCompetition(req, res, next) {
        const competitionId = String(req.query.competitionId ?? '');
        if (!competitionId)
            throw new response_error_1.ResponseError(400, 'competitionId is required');
        let page = parseInt(String(req.query.page ?? '1'), 10);
        let size = parseInt(String(req.query.size ?? '50'), 10);
        if (!Number.isFinite(page) || page < 1)
            page = 1;
        if (!Number.isFinite(size) || size < 1)
            size = 50;
        size = Math.min(Math.max(size, 1), 100);
        const response = await comment_service_1.CommentService.getByCompetition(competitionId, page, size);
        return (0, api_response_1.success)(res, 200, 'Comments retrieved successfully', response);
    }
    static async remove(req, res, next) {
        const user = await user_model_1.default.findById(req.user._id);
        const role = user ? user.role : 'mahasiswa';
        await comment_service_1.CommentService.remove(String(req.params.id), req.user._id, role);
        return (0, api_response_1.success)(res, 200, 'Comment deleted successfully', { id: req.params.id });
    }
}
exports.CommentController = CommentController;
