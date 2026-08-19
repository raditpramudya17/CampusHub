/**
 * UserController — lapisan HTTP modul user.
 * Pola setiap method: ambil data dari request → panggil UserService → bungkus response sukses.
 * Tidak perlu try/catch: Express 5 otomatis meneruskan error async ke error-middleware.
 * req.user dijamin ada oleh auth-middleware (semua route modul ini memakainya).
 */
import type {NextFunction, Response, Request} from "express";
import type {UserRequest, UserResponse, UserUpdatePasswordRequest, UserUpdateRequest} from "../../../types/user.types";
import type {Pageable} from "../../../types/common.types";
import {UserService} from "../services/user.service";
import {success} from "../../../utils/api-response";

export class UserController {
    /** GET /api/users/me — ambil data user yang sedang login. */
    static async get(req: UserRequest, res: Response, next: NextFunction): Promise<Response> {
        const response: UserResponse = await UserService.get(req.user!._id);
        return success(res, 200, 'User retrieved successfully', response);
    };

    static async getUsername(req: Request, res: Response, next: NextFunction): Promise<Response> {
        const { username = '' } = req.params;
        const response: UserResponse = await  UserService.getUsername(String(username));
        return success(res, 200, 'User retrieved successfully', response);
    }

    /** PATCH /api/users/me — update profil (firstName, lastName, username, gender). */
    static async update(req: UserRequest, res: Response, next: NextFunction): Promise<Response> {
        const request = req.body as UserUpdateRequest;
        const response: UserResponse = await UserService.update(req.user!._id, request);
        return success(res, 200, 'User updated successfully', response);
    };

    /** PATCH /api/users/me/password — ganti password (wajib password lama). */
    static async updatePassword(req: UserRequest, res: Response, next: NextFunction): Promise<Response> {
        const request = req.body as UserUpdatePasswordRequest;
        await UserService.updatePassword(req.user!._id, request);
        return success(res, 200, 'Password updated successfully, please login again on other devices', null);
    };

    /** PATCH /api/users/:id/role — admin-only (dijaga adminMiddleware di router). */
    static async updateRole(req: UserRequest, res: Response, next: NextFunction): Promise<Response> {
        const {role} = req.body as { role: string };
        const response: UserResponse = await UserService.updateRole(String(req.params.id), role);
        return success(res, 200, 'User role updated successfully', response);
    };

    /** GET /api/users — admin-only (dijaga adminMiddleware di router): daftar semua user. */
    static async getAll(req: UserRequest, res: Response, next: NextFunction): Promise<Response> {
        let page = parseInt(String(req.query.page ?? '1'), 10);
        let size = parseInt(String(req.query.size ?? '20'), 10);
        if (!Number.isFinite(page) || page < 1) page = 1;
        if (!Number.isFinite(size) || size < 1) size = 20;
        size = Math.min(Math.max(size, 1), 100);

        const response: Pageable<UserResponse> = await UserService.getAll(page, size);
        return success(res, 200, 'Users retrieved successfully', response);
    }

    /** GET /api/users/leaderboard — publik: top kontributor lomba approved. */
    static async leaderboard(req: Request, res: Response, next: NextFunction): Promise<Response> {
        const response = await UserService.getLeaderboard(10);
        return success(res, 200, 'Leaderboard retrieved successfully', response);
    }
}
