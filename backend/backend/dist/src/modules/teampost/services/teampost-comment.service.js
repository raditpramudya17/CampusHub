"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamPostCommentService = void 0;
const mongoose_1 = require("mongoose");
const teampost_comment_model_1 = __importDefault(require("../models/teampost-comment.model"));
const teampost_model_1 = __importDefault(require("../models/teampost.model"));
const teampost_comment_response_1 = require("../responses/teampost-comment.response");
const validation_1 = require("../../../validations/validation");
const teampost_validation_1 = require("../validations/teampost.validation");
const response_error_1 = require("../../../errors/response-error");
class TeamPostCommentService {
    static async create(authorId, teamPostId, text) {
        const validated = validation_1.Validation.validate(teampost_validation_1.TeamPostValidation.COMMENT_CREATE, { text });
        if (!mongoose_1.Types.ObjectId.isValid(teamPostId)) {
            throw new response_error_1.ResponseError(404, 'Team post not found');
        }
        const post = await teampost_model_1.default.findById(teamPostId);
        if (!post)
            throw new response_error_1.ResponseError(404, 'Team post not found');
        const comment = new teampost_comment_model_1.default({ teamPost: teamPostId, author: authorId, text: validated.text });
        await comment.save();
        await comment.populate('author', 'username email');
        return (0, teampost_comment_response_1.teamPostCommentResponse)(comment);
    }
    static async getByTeamPost(teamPostId, page, size) {
        if (!mongoose_1.Types.ObjectId.isValid(teamPostId)) {
            return { data: [], paging: { page, size, total: 0 } };
        }
        const skip = Math.max(0, (page - 1) * size);
        const query = { teamPost: teamPostId };
        const total = await teampost_comment_model_1.default.countDocuments(query);
        const comments = await teampost_comment_model_1.default
            .find(query)
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(size)
            .populate('author', 'username email');
        return { data: comments.map(teampost_comment_response_1.teamPostCommentResponse), paging: { page, size, total } };
    }
    static async remove(id, userId, userRole) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            throw new response_error_1.ResponseError(404, 'Comment not found');
        const comment = await teampost_comment_model_1.default.findById(id);
        if (!comment)
            throw new response_error_1.ResponseError(404, 'Comment not found');
        if (String(comment.author) !== String(userId) && userRole !== 'admin') {
            throw new response_error_1.ResponseError(403, 'Forbidden: not allowed to delete this comment');
        }
        await teampost_comment_model_1.default.deleteOne({ _id: id });
    }
}
exports.TeamPostCommentService = TeamPostCommentService;
