"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AchievementController = void 0;
const achievement_service_1 = require("../services/achievement.service");
const api_response_1 = require("../../../utils/api-response");
const user_model_1 = __importDefault(require("../../user/models/user.model"));
class AchievementController {
    /** POST /api/achievements — lapor prestasi (masuk antrean moderasi). */
    static async create(req, res, next) {
        const request = req.body;
        const response = await achievement_service_1.AchievementService.create(req.user._id, request);
        return (0, api_response_1.success)(res, 201, 'Achievement submitted successfully, waiting for admin approval', response);
    }
    /** GET /api/achievements — publik (approved) atau dibatasi sesuai role, lihat AchievementService.getAll. */
    static async getAll(req, res, next) {
        let page = parseInt(String(req.query.page ?? '1'), 10);
        let size = parseInt(String(req.query.size ?? '20'), 10);
        if (!Number.isFinite(page) || page < 1)
            page = 1;
        if (!Number.isFinite(size) || size < 1)
            size = 20;
        size = Math.min(Math.max(size, 1), 100);
        let requester;
        if (req.user?._id) {
            const user = await user_model_1.default.findById(req.user._id);
            requester = { id: String(req.user._id), role: user ? user.role : 'mahasiswa' };
        }
        const status = req.query.status ? String(req.query.status) : undefined;
        const response = await achievement_service_1.AchievementService.getAll(page, size, status, requester);
        return (0, api_response_1.success)(res, 200, 'Achievements retrieved successfully', response);
    }
    /** PATCH /api/achievements/:id/approve — admin-only (dijaga adminMiddleware di router). */
    static async approve(req, res, next) {
        const response = await achievement_service_1.AchievementService.approve(String(req.params.id), req.user._id);
        return (0, api_response_1.success)(res, 200, 'Achievement approved', response);
    }
    /** PATCH /api/achievements/:id/reject — admin-only (dijaga adminMiddleware di router). */
    static async reject(req, res, next) {
        const { rejectionReason } = req.body;
        const response = await achievement_service_1.AchievementService.reject(String(req.params.id), req.user._id, rejectionReason);
        return (0, api_response_1.success)(res, 200, 'Achievement rejected', response);
    }
}
exports.AchievementController = AchievementController;
