"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AchievementService = void 0;
/**
 * AchievementService — logika bisnis modul achievement (Wall of Fame).
 * Aturan visibilitas status sama persis dengan CompetitionService.getAll —
 * lihat komentar di sana untuk penjelasan lengkap.
 */
const mongoose_1 = require("mongoose");
const achievement_model_1 = __importDefault(require("../models/achievement.model"));
const achievement_response_1 = require("../responses/achievement.response");
const validation_1 = require("../../../validations/validation");
const achievement_validation_1 = require("../validations/achievement.validation");
const response_error_1 = require("../../../errors/response-error");
const AUTHOR_SELECT = 'username email role';
class AchievementService {
    static async create(authorId, request) {
        const createRequest = validation_1.Validation.validate(achievement_validation_1.AchievementValidation.CREATE, request);
        const achievement = new achievement_model_1.default({ ...createRequest, author: authorId });
        await achievement.save();
        return (0, achievement_response_1.achievementResponse)(achievement);
    }
    static async getAll(page, size, status, requester) {
        const skip = Math.max(0, (Number(page) - 1) * Number(size));
        const limit = Math.max(1, Number(size));
        const requestedStatus = status ? String(status).toLowerCase() : '';
        const wantsNonApproved = requestedStatus.length > 0 && requestedStatus !== 'approved';
        const isAdmin = requester?.role === 'admin';
        const query = {};
        if (!wantsNonApproved) {
            query.status = 'approved';
        }
        else if (isAdmin) {
            if (requestedStatus !== 'all')
                query.status = requestedStatus;
        }
        else if (requester?.id) {
            query.author = requester.id;
            if (requestedStatus !== 'all')
                query.status = requestedStatus;
        }
        else {
            query.status = 'approved';
        }
        const total = await achievement_model_1.default.countDocuments(query);
        const achievements = await achievement_model_1.default
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author', AUTHOR_SELECT);
        return {
            data: achievements.map(a => (0, achievement_response_1.achievementResponse)(a, requester)),
            paging: { page, size, total }
        };
    }
    static async approve(id, adminId) {
        const achievement = await this.findOrThrow(id);
        achievement.status = 'approved';
        achievement.rejectionReason = null;
        achievement.reviewedBy = adminId;
        achievement.reviewedAt = new Date();
        await achievement.save();
        await achievement.populate('author', AUTHOR_SELECT);
        return (0, achievement_response_1.achievementResponse)(achievement, { id: String(adminId), role: 'admin' });
    }
    static async reject(id, adminId, rejectionReason) {
        const validated = validation_1.Validation.validate(achievement_validation_1.AchievementValidation.REJECT, { rejectionReason });
        const achievement = await this.findOrThrow(id);
        achievement.status = 'rejected';
        achievement.rejectionReason = validated.rejectionReason;
        achievement.reviewedBy = adminId;
        achievement.reviewedAt = new Date();
        await achievement.save();
        await achievement.populate('author', AUTHOR_SELECT);
        return (0, achievement_response_1.achievementResponse)(achievement, { id: String(adminId), role: 'admin' });
    }
    static async findOrThrow(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            throw new response_error_1.ResponseError(404, 'Achievement not found');
        }
        const achievement = await achievement_model_1.default.findById(id);
        if (!achievement) {
            throw new response_error_1.ResponseError(404, 'Achievement not found');
        }
        return achievement;
    }
}
exports.AchievementService = AchievementService;
