"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompetitionController = void 0;
const competition_service_1 = require("../services/competition.service");
const api_response_1 = require("../../../utils/api-response");
const user_model_1 = __importDefault(require("../../user/models/user.model"));
class CompetitionController {
    /** POST /api/competitions — unggah lomba baru (masuk antrean moderasi). */
    static async create(req, res, next) {
        const request = req.body;
        const response = await competition_service_1.CompetitionService.create(req.user._id, request);
        return (0, api_response_1.success)(res, 201, 'Competition submitted successfully, waiting for admin approval', response);
    }
    ;
    /** GET /api/competitions — ambil lomba (approved untuk publik; status lain dibatasi sesuai role, lihat CompetitionService.getAll). */
    static async getAll(req, res, next) {
        const rawPage = String(req.query.page ?? '1');
        const rawSize = String(req.query.size ?? '10');
        let page = parseInt(rawPage, 10);
        let size = parseInt(rawSize, 10);
        if (!Number.isFinite(page) || page < 1)
            page = 1;
        if (!Number.isFinite(size) || size < 1)
            size = 10;
        size = Math.min(Math.max(size, 1), 100);
        // collect filter params
        const filters = {};
        if (req.query.q)
            filters.q = String(req.query.q);
        if (req.query.category)
            filters.category = String(req.query.category);
        if (req.query.fee)
            filters.fee = String(req.query.fee);
        if (req.query.format)
            filters.format = String(req.query.format);
        if (req.query.level)
            filters.level = String(req.query.level);
        if (req.query.tags)
            filters.tags = String(req.query.tags);
        if (req.query.tab)
            filters.tab = String(req.query.tab);
        if (req.query.status)
            filters.status = String(req.query.status);
        // optionalAuthMiddleware may have attached req.user — resolve their role
        // so the service can decide how much of a non-approved status filter to honor
        let requester;
        if (req.user?._id) {
            const user = await user_model_1.default.findById(req.user._id);
            requester = { id: String(req.user._id), role: user ? user.role : 'mahasiswa' };
        }
        const response = await competition_service_1.CompetitionService.getAll(page, size, filters, requester);
        return (0, api_response_1.success)(res, 200, 'Competitions retrieved successfully', response);
    }
    static async delete(req, res, next) {
        const id = String(req.params.id);
        const user = await user_model_1.default.findById(req.user._id);
        const role = user ? user.role : 'mahasiswa';
        await competition_service_1.CompetitionService.delete(id, req.user._id, role);
        return (0, api_response_1.success)(res, 200, 'Competition deleted successfully', { id });
    }
    /** PATCH /api/competitions/:id/approve — admin-only (dijaga adminMiddleware di router). */
    static async approve(req, res, next) {
        const response = await competition_service_1.CompetitionService.approve(String(req.params.id), req.user._id);
        return (0, api_response_1.success)(res, 200, 'Competition approved', response);
    }
    /** PATCH /api/competitions/:id/reject — admin-only (dijaga adminMiddleware di router), body {rejectionReason}. */
    static async reject(req, res, next) {
        const { rejectionReason } = req.body;
        const response = await competition_service_1.CompetitionService.reject(String(req.params.id), req.user._id, rejectionReason);
        return (0, api_response_1.success)(res, 200, 'Competition rejected', response);
    }
    /** GET /api/competitions/audit — admin-only (dijaga adminMiddleware di router): riwayat moderasi. */
    static async audit(req, res, next) {
        let page = parseInt(String(req.query.page ?? '1'), 10);
        let size = parseInt(String(req.query.size ?? '20'), 10);
        if (!Number.isFinite(page) || page < 1)
            page = 1;
        if (!Number.isFinite(size) || size < 1)
            size = 20;
        size = Math.min(Math.max(size, 1), 100);
        const response = await competition_service_1.CompetitionService.getAudit(page, size);
        return (0, api_response_1.success)(res, 200, 'Moderation audit retrieved successfully', response);
    }
    /** GET /api/competitions/stats — admin-only (dijaga adminMiddleware di router): dashboard statistik. */
    static async stats(req, res, next) {
        const response = await competition_service_1.CompetitionService.getStats();
        return (0, api_response_1.success)(res, 200, 'Stats retrieved successfully', response);
    }
}
exports.CompetitionController = CompetitionController;
