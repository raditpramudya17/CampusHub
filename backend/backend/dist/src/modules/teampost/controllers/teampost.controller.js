"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamPostController = void 0;
const teampost_service_1 = require("../services/teampost.service");
const api_response_1 = require("../../../utils/api-response");
const user_model_1 = __importDefault(require("../../user/models/user.model"));
class TeamPostController {
    static async create(req, res, next) {
        const request = req.body;
        const response = await teampost_service_1.TeamPostService.create(req.user._id, request);
        return (0, api_response_1.success)(res, 201, 'Team post created successfully', response);
    }
    static async getAll(req, res, next) {
        let page = parseInt(String(req.query.page ?? '1'), 10);
        let size = parseInt(String(req.query.size ?? '30'), 10);
        if (!Number.isFinite(page) || page < 1)
            page = 1;
        if (!Number.isFinite(size) || size < 1)
            size = 30;
        size = Math.min(Math.max(size, 1), 100);
        const requesterId = req.user?._id ? String(req.user._id) : undefined;
        const response = await teampost_service_1.TeamPostService.getAll(page, size, requesterId);
        return (0, api_response_1.success)(res, 200, 'Team posts retrieved successfully', response);
    }
    static async remove(req, res, next) {
        const user = await user_model_1.default.findById(req.user._id);
        const role = user ? user.role : 'mahasiswa';
        await teampost_service_1.TeamPostService.remove(String(req.params.id), req.user._id, role);
        return (0, api_response_1.success)(res, 200, 'Team post deleted successfully', { id: req.params.id });
    }
    /** POST /api/teamposts/:id/vote — vote naik (1) atau turun (-1); klik ulang = batalkan vote. */
    static async vote(req, res, next) {
        const value = req.body?.value;
        const result = await teampost_service_1.TeamPostService.vote(String(req.params.id), req.user._id, value);
        return (0, api_response_1.success)(res, 200, 'Vote recorded successfully', result);
    }
}
exports.TeamPostController = TeamPostController;
