"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_model_1 = __importDefault(require("../models/user.model"));
const session_model_1 = __importDefault(require("../../auth/models/session.model"));
const competition_model_1 = __importDefault(require("../../competition/models/competition.model"));
const user_response_1 = require("../responses/user.response");
const response_error_1 = require("../../../errors/response-error");
const validation_1 = require("../../../validations/validation");
const user_validation_1 = require("../validations/user.validation");
class UserService {
    /** Helper: cari user berdasarkan id; 404 jika sudah tidak ada di database. */
    static async findById(userId) {
        const user = await user_model_1.default.findById(userId);
        if (!user)
            throw new response_error_1.ResponseError(404, 'User not found');
        return user;
    }
    /** Mengambil data user yang sedang login berdasarkan id dari token. */
    static async get(userId) {
        const user = await this.findById(userId);
        return (0, user_response_1.userResponse)(user);
    }
    /** Endpoint ini publik (tanpa auth) — WAJIB lewat userResponse() agar password hash & verificationCode tidak pernah bocor. */
    static async getUsername(username) {
        const user = await user_model_1.default.findOne({ username: username });
        if (!user)
            throw new response_error_1.ResponseError(404, 'User not found');
        return (0, user_response_1.userResponse)(user);
    }
    /**
     * Update profil user (partial update).
     * Email & password sengaja tidak bisa diubah di sini:
     * - email terikat status verifikasi
     * - password punya endpoint sendiri (butuh password lama)
     */
    static async update(userId, request) {
        const updateRequest = validation_1.Validation.validate(user_validation_1.UserValidation.UPDATE, request);
        const user = await this.findById(userId);
        // Username baru tidak boleh dipakai user lain
        if (updateRequest.username && updateRequest.username !== user.username) {
            const exists = await user_model_1.default.findOne({ username: updateRequest.username });
            if (exists)
                throw new response_error_1.ResponseError(400, 'Username already exists');
        }
        // Hanya field yang dikirim yang berubah
        Object.assign(user, updateRequest);
        await user.save();
        return (0, user_response_1.userResponse)(user);
    }
    /**
     * Ganti password — wajib memverifikasi password lama terlebih dahulu.
     * Setelah berhasil, SEMUA sesi (refresh token) user dicabut agar
     * perangkat lain yang mungkin diretas harus login ulang.
     */
    static async updatePassword(userId, request) {
        const passwordRequest = validation_1.Validation.validate(user_validation_1.UserValidation.UPDATE_PASSWORD, request);
        const user = await this.findById(userId);
        // Akun Google yang belum pernah set password tidak punya password lama untuk dicocokkan
        if (!user.password)
            throw new response_error_1.ResponseError(400, 'Account has no password set, this is a Google-linked account');
        // Password lama harus cocok — bukti pemilik akun yang sah
        const isMatch = await bcrypt_1.default.compare(passwordRequest.oldPassword, user.password);
        if (!isMatch)
            throw new response_error_1.ResponseError(400, 'Old password is incorrect');
        user.password = await bcrypt_1.default.hash(passwordRequest.newPassword, 10);
        await user.save();
        // Cabut semua sesi login: perangkat lain wajib login ulang dengan password baru
        await session_model_1.default.deleteMany({ user: user._id });
    }
    /** Ubah role user — dipanggil hanya setelah controller memverifikasi requester adalah admin. */
    static async updateRole(targetUserId, role) {
        const validated = validation_1.Validation.validate(user_validation_1.UserValidation.UPDATE_ROLE, { role });
        const user = await user_model_1.default.findById(targetUserId);
        if (!user)
            throw new response_error_1.ResponseError(404, 'User not found');
        user.role = validated.role;
        await user.save();
        return (0, user_response_1.userResponse)(user);
    }
    /** Daftar semua user (admin-only, dicek di router) — untuk panel manajemen role. */
    static async getAll(page, size) {
        const skip = Math.max(0, (page - 1) * size);
        const total = await user_model_1.default.countDocuments();
        const users = await user_model_1.default.find().sort({ createdAt: -1 }).skip(skip).limit(size);
        return { data: users.map(user_response_1.userResponse), paging: { page, size, total } };
    }
    /** Top kontributor: user dengan lomba approved terbanyak (endpoint publik). */
    static async getLeaderboard(limit = 10) {
        const agg = await competition_model_1.default.aggregate([
            { $match: { status: 'approved' } },
            { $group: { _id: '$author', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: limit },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
            { $unwind: '$user' }
        ]);
        return agg.map((a) => ({
            username: a.user.username,
            firstName: a.user.firstName,
            lastName: a.user.lastName,
            role: a.user.role,
            approvedCount: a.count
        }));
    }
}
exports.UserService = UserService;
