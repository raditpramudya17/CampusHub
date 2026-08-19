/**
 * CompetitionController — lapisan HTTP modul competition.
 * Tidak perlu try/catch: Express 5 otomatis meneruskan error async ke error-middleware.
 * req.user dijamin ada oleh auth-middleware pada route yang mewajibkannya.
 */
import type {NextFunction, Response} from "express";
import type {UserRequest} from "../../../types/user.types";
import type {
    CompetitionAuditResponse,
    CompetitionCreateRequest,
    CompetitionResponse,
    CompetitionStatsResponse
} from "../../../types/competition.types";
import {CompetitionService} from "../services/competition.service";
import {success} from "../../../utils/api-response";
import {Pageable} from "../../../types/common.types";
import UserModel from "../../user/models/user.model";

export class CompetitionController {
    /** POST /api/competitions — unggah lomba baru (masuk antrean moderasi). */
    static async create(req: UserRequest, res: Response, next: NextFunction): Promise<Response> {
        const request = req.body as CompetitionCreateRequest;
        const response: CompetitionResponse = await CompetitionService.create(req.user!._id, request);
        return success(res, 201, 'Competition submitted successfully, waiting for admin approval', response);
    };

    /** GET /api/competitions — ambil lomba (approved untuk publik; status lain dibatasi sesuai role, lihat CompetitionService.getAll). */
    static async getAll(req: UserRequest, res: Response, next: NextFunction): Promise<Response> {
        const rawPage = String(req.query.page ?? '1');
        const rawSize = String(req.query.size ?? '10');
        let page = parseInt(rawPage, 10);
        let size = parseInt(rawSize, 10);
        if (!Number.isFinite(page) || page < 1) page = 1;
        if (!Number.isFinite(size) || size < 1) size = 10;
        size = Math.min(Math.max(size, 1), 100);

        // collect filter params
        const filters: any = {};
        if (req.query.q) filters.q = String(req.query.q);
        if (req.query.category) filters.category = String(req.query.category);
        if (req.query.fee) filters.fee = String(req.query.fee);
        if (req.query.format) filters.format = String(req.query.format);
        if (req.query.level) filters.level = String(req.query.level);
        if (req.query.tags) filters.tags = String(req.query.tags);
        if (req.query.tab) filters.tab = String(req.query.tab);
        if (req.query.status) filters.status = String(req.query.status);

        // optionalAuthMiddleware may have attached req.user — resolve their role
        // so the service can decide how much of a non-approved status filter to honor
        let requester: { id: string; role: string } | undefined;
        if (req.user?._id) {
            const user = await UserModel.findById(req.user._id);
            requester = {id: String(req.user._id), role: user ? user.role : 'mahasiswa'};
        }

        const response: Pageable<CompetitionResponse> = await CompetitionService.getAll(page, size, filters, requester);
        return success(res, 200, 'Competitions retrieved successfully', response);
    }

    static async delete(req: UserRequest, res: Response, next: NextFunction): Promise<Response> {
        const id = String(req.params.id);
        const user = await UserModel.findById(req.user!._id);
        const role = user ? user.role : 'mahasiswa';
        await CompetitionService.delete(id, req.user!._id, role);
        return success(res, 200, 'Competition deleted successfully', {id});
    }

    /** PATCH /api/competitions/:id/approve — admin-only (dijaga adminMiddleware di router). */
    static async approve(req: UserRequest, res: Response, next: NextFunction): Promise<Response> {
        const response = await CompetitionService.approve(String(req.params.id), req.user!._id);
        return success(res, 200, 'Competition approved', response);
    }

    /** PATCH /api/competitions/:id/reject — admin-only (dijaga adminMiddleware di router), body {rejectionReason}. */
    static async reject(req: UserRequest, res: Response, next: NextFunction): Promise<Response> {
        const {rejectionReason} = req.body as { rejectionReason: string };
        const response = await CompetitionService.reject(String(req.params.id), req.user!._id, rejectionReason);
        return success(res, 200, 'Competition rejected', response);
    }

    /** GET /api/competitions/audit — admin-only (dijaga adminMiddleware di router): riwayat moderasi. */
    static async audit(req: UserRequest, res: Response, next: NextFunction): Promise<Response> {
        let page = parseInt(String(req.query.page ?? '1'), 10);
        let size = parseInt(String(req.query.size ?? '20'), 10);
        if (!Number.isFinite(page) || page < 1) page = 1;
        if (!Number.isFinite(size) || size < 1) size = 20;
        size = Math.min(Math.max(size, 1), 100);

        const response: Pageable<CompetitionAuditResponse> = await CompetitionService.getAudit(page, size);
        return success(res, 200, 'Moderation audit retrieved successfully', response);
    }

    /** GET /api/competitions/stats — admin-only (dijaga adminMiddleware di router): dashboard statistik. */
    static async stats(req: UserRequest, res: Response, next: NextFunction): Promise<Response> {
        const response: CompetitionStatsResponse = await CompetitionService.getStats();
        return success(res, 200, 'Stats retrieved successfully', response);
    }
}
