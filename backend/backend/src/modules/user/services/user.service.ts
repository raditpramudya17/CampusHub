/**
 * UserService — logika bisnis modul user.
 */
import {Types} from "mongoose";
import bcrypt from "bcrypt";
import UserModel from "../models/user.model";
import Session from "../../auth/models/session.model";
import CompetitionModel from "../../competition/models/competition.model";
import {userResponse} from "../responses/user.response";
import type {UserResponse, UserTypes, UserUpdatePasswordRequest, UserUpdateRequest} from "../../../types/user.types";
import type {Pageable} from "../../../types/common.types";
import {ResponseError} from "../../../errors/response-error";
import {Validation} from "../../../validations/validation";
import {UserValidation} from "../validations/user.validation";

export class UserService {
    /** Helper: cari user berdasarkan id; 404 jika sudah tidak ada di database. */
    private static async findById(userId: Types.ObjectId) {
        const user = await UserModel.findById(userId);
        if (!user) throw new ResponseError(404, 'User not found');
        return user;
    }

    /** Mengambil data user yang sedang login berdasarkan id dari token. */
    static async get(userId: Types.ObjectId): Promise<UserResponse> {
        const user = await this.findById(userId);
        return userResponse(user);
    }

    /** Endpoint ini publik (tanpa auth) — WAJIB lewat userResponse() agar password hash & verificationCode tidak pernah bocor. */
    static async getUsername(username: string): Promise<UserResponse> {
        const user = await UserModel.findOne({ username: username});
        if (!user) throw new ResponseError(404, 'User not found');
        return userResponse(user);
    }

    /**
     * Update profil user (partial update).
     * Email & password sengaja tidak bisa diubah di sini:
     * - email terikat status verifikasi
     * - password punya endpoint sendiri (butuh password lama)
     */
    static async update(userId: Types.ObjectId, request: UserUpdateRequest): Promise<UserResponse> {
        const updateRequest: UserUpdateRequest = Validation.validate(UserValidation.UPDATE, request);
        const user = await this.findById(userId);

        // Username baru tidak boleh dipakai user lain
        if (updateRequest.username && updateRequest.username !== user.username) {
            const exists = await UserModel.findOne({ username: updateRequest.username });
            if (exists) throw new ResponseError(400, 'Username already exists');
        }

        // Hanya field yang dikirim yang berubah
        Object.assign(user, updateRequest);
        await user.save();

        return userResponse(user);
    }

    /**
     * Ganti password — wajib memverifikasi password lama terlebih dahulu.
     * Setelah berhasil, SEMUA sesi (refresh token) user dicabut agar
     * perangkat lain yang mungkin diretas harus login ulang.
     */
    static async updatePassword(userId: Types.ObjectId, request: UserUpdatePasswordRequest): Promise<void> {
        const passwordRequest: UserUpdatePasswordRequest = Validation.validate(UserValidation.UPDATE_PASSWORD, request);
        const user = await this.findById(userId);

        // Akun Google yang belum pernah set password tidak punya password lama untuk dicocokkan
        if (!user.password) throw new ResponseError(400, 'Account has no password set, this is a Google-linked account');

        // Password lama harus cocok — bukti pemilik akun yang sah
        const isMatch: boolean = await bcrypt.compare(passwordRequest.oldPassword, user.password);
        if (!isMatch) throw new ResponseError(400, 'Old password is incorrect');

        user.password = await bcrypt.hash(passwordRequest.newPassword, 10);
        await user.save();

        // Cabut semua sesi login: perangkat lain wajib login ulang dengan password baru
        await Session.deleteMany({ user: user._id });
    }

    /** Ubah role user — dipanggil hanya setelah controller memverifikasi requester adalah admin. */
    static async updateRole(targetUserId: string, role: string): Promise<UserResponse> {
        const validated = Validation.validate(UserValidation.UPDATE_ROLE, { role });
        const user = await UserModel.findById(targetUserId);
        if (!user) throw new ResponseError(404, 'User not found');

        user.role = validated.role as UserTypes['role'];
        await user.save();

        return userResponse(user);
    }

    /** Daftar semua user (admin-only, dicek di router) — untuk panel manajemen role. */
    static async getAll(page: number, size: number): Promise<Pageable<UserResponse>> {
        const skip = Math.max(0, (page - 1) * size);
        const total = await UserModel.countDocuments();
        const users = await UserModel.find().sort({createdAt: -1}).skip(skip).limit(size);
        return {data: users.map(userResponse), paging: {page, size, total}};
    }

    /** Top kontributor: user dengan lomba approved terbanyak (endpoint publik). */
    static async getLeaderboard(limit: number = 10) {
        const agg = await CompetitionModel.aggregate([
            {$match: {status: 'approved'}},
            {$group: {_id: '$author', count: {$sum: 1}}},
            {$sort: {count: -1}},
            {$limit: limit},
            {$lookup: {from: 'users', localField: '_id', foreignField: '_id', as: 'user'}},
            {$unwind: '$user'}
        ]);
        return agg.map((a: any) => ({
            username: a.user.username,
            firstName: a.user.firstName,
            lastName: a.user.lastName,
            role: a.user.role,
            approvedCount: a.count
        }));
    }
}
