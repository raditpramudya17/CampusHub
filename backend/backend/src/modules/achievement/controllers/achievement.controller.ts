/**
 * AchievementController — lapisan HTTP modul achievement.
 */
import type {NextFunction, Response} from "express";
import type {UserRequest} from "../../../types/user.types";
import type {AchievementCreateRequest, AchievementResponse} from "../../../types/achievement.types";
import {AchievementService} from "../services/achievement.service";
import {success} from "../../../utils/api-response";
import {Pageable} from "../../../types/common.types";
import UserModel from "../../user/models/user.model";

export class AchievementController {
    /** POST /api/achievements — lapor prestasi (masuk antrean moderasi). */
    static async create(req: UserRequest, res: Response, next: NextFunction): Promise<Response> {
        const request = req.body as AchievementCreateRequest;
        const response: AchievementResponse = await AchievementService.create(req.user!._id, request);
        return success(res, 201, 'Achievement submitted successfully, waiting for admin approval', response);
    }

    /** GET /api/achievements — publik (approved) atau dibatasi sesuai role, lihat AchievementService.getAll. */
    static async getAll(req: UserRequest, res: Response, next: NextFunction): Promise<Response> {
        let page = parseInt(String(req.query.page ?? '1'), 10);
        let size = parseInt(String(req.query.size ?? '20'), 10);
        if (!Number.isFinite(page) || page < 1) page = 1;
        if (!Number.isFinite(size) || size < 1) size = 20;
        size = Math.min(Math.max(size, 1), 100);

        let requester: { id: string; role: string } | undefined;
        if (req.user?._id) {
            const user = await UserModel.findById(req.user._id);
            requester = {id: String(req.user._id), role: user ? user.role : 'mahasiswa'};
        }

        const status = req.query.status ? String(req.query.status) : undefined;
        const response: Pageable<AchievementResponse> = await AchievementService.getAll(page, size, status, requester);
        return success(res, 200, 'Achievements retrieved successfully', response);
    }

    /** PATCH /api/achievements/:id/approve — admin-only (dijaga adminMiddleware di router). */
    static async approve(req: UserRequest, res: Response, next: NextFunction): Promise<Response> {
        const response = await AchievementService.approve(String(req.params.id), req.user!._id);
        return success(res, 200, 'Achievement approved', response);
    }

    /** PATCH /api/achievements/:id/reject — admin-only (dijaga adminMiddleware di router). */
    static async reject(req: UserRequest, res: Response, next: NextFunction): Promise<Response> {
        const {rejectionReason} = req.body as { rejectionReason: string };
        const response = await AchievementService.reject(String(req.params.id), req.user!._id, rejectionReason);
        return success(res, 200, 'Achievement rejected', response);
    }
}
