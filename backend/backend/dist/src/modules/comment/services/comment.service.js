"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentService = void 0;
const mongoose_1 = require("mongoose");
const comment_model_1 = __importDefault(require("../models/comment.model"));
const competition_model_1 = __importDefault(require("../../competition/models/competition.model"));
const comment_response_1 = require("../responses/comment.response");
const validation_1 = require("../../../validations/validation");
const comment_validation_1 = require("../validations/comment.validation");
const response_error_1 = require("../../../errors/response-error");
class CommentService {
    static async create(authorId, competitionId, text) {
        const validated = validation_1.Validation.validate(comment_validation_1.CommentValidation.CREATE, { competitionId, text });
        if (!mongoose_1.Types.ObjectId.isValid(validated.competitionId)) {
            throw new response_error_1.ResponseError(404, 'Competition not found');
        }
        const competition = await competition_model_1.default.findById(validated.competitionId);
        if (!competition)
            throw new response_error_1.ResponseError(404, 'Competition not found');
        const comment = new comment_model_1.default({ competition: validated.competitionId, author: authorId, text: validated.text });
        await comment.save();
        await comment.populate('author', 'username email');
        return (0, comment_response_1.commentResponse)(comment);
    }
    static async getByCompetition(competitionId, page, size) {
        if (!mongoose_1.Types.ObjectId.isValid(competitionId)) {
            return { data: [], paging: { page, size, total: 0 } };
        }
        const skip = Math.max(0, (page - 1) * size);
        const query = { competition: competitionId };
        const total = await comment_model_1.default.countDocuments(query);
        const comments = await comment_model_1.default
            .find(query)
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(size)
            .populate('author', 'username email');
        return { data: comments.map(comment_response_1.commentResponse), paging: { page, size, total } };
    }
    static async remove(id, userId, userRole) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            throw new response_error_1.ResponseError(404, 'Comment not found');
        const comment = await comment_model_1.default.findById(id);
        if (!comment)
            throw new response_error_1.ResponseError(404, 'Comment not found');
        if (String(comment.author) !== String(userId) && userRole !== 'admin') {
            throw new response_error_1.ResponseError(403, 'Forbidden: not allowed to delete this comment');
        }
        await comment_model_1.default.deleteOne({ _id: id });
    }
}
exports.CommentService = CommentService;
