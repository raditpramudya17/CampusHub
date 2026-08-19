"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const api_response_1 = require("../../../utils/api-response");
class UserController {
    /** GET /api/users/me — ambil data user yang sedang login. */
    static async get(req, res, next) {
        const response = await user_service_1.UserService.get(req.user._id);
        return (0, api_response_1.success)(res, 200, 'User retrieved successfully', response);
    }
    ;
    static async getUsername(req, res, next) {
        const { username = '' } = req.params;
        const response = await user_service_1.UserService.getUsername(String(username));
        return (0, api_response_1.success)(res, 200, 'User retrieved successfully', response);
    }
    /** PATCH /api/users/me — update profil (firstName, lastName, username, gender). */
    static async update(req, res, next) {
        const request = req.body;
        const response = await user_service_1.UserService.update(req.user._id, request);
        return (0, api_response_1.success)(res, 200, 'User updated successfully', response);
    }
    ;
    /** PATCH /api/users/me/password — ganti password (wajib password lama). */
    static async updatePassword(req, res, next) {
        const request = req.body;
        await user_service_1.UserService.updatePassword(req.user._id, request);
        return (0, api_response_1.success)(res, 200, 'Password updated successfully, please login again on other devices', null);
    }
    ;
    /** PATCH /api/users/:id/role — admin-only (dijaga adminMiddleware di router). */
    static async updateRole(req, res, next) {
        const { role } = req.body;
        const response = await user_service_1.UserService.updateRole(String(req.params.id), role);
        return (0, api_response_1.success)(res, 200, 'User role updated successfully', response);
    }
    ;
    /** GET /api/users — admin-only (dijaga adminMiddleware di router): daftar semua user. */
    static async getAll(req, res, next) {
        let page = parseInt(String(req.query.page ?? '1'), 10);
        let size = parseInt(String(req.query.size ?? '20'), 10);
        if (!Number.isFinite(page) || page < 1)
            page = 1;
        if (!Number.isFinite(size) || size < 1)
            size = 20;
        size = Math.min(Math.max(size, 1), 100);
        const response = await user_service_1.UserService.getAll(page, size);
        return (0, api_response_1.success)(res, 200, 'Users retrieved successfully', response);
    }
    /** GET /api/users/leaderboard — publik: top kontributor lomba approved. */
    static async leaderboard(req, res, next) {
        const response = await user_service_1.UserService.getLeaderboard(10);
        return (0, api_response_1.success)(res, 200, 'Leaderboard retrieved successfully', response);
    }
}
exports.UserController = UserController;
