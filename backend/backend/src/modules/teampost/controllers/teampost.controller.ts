import type {NextFunction, Response} from "express";
import type {UserRequest} from "../../../types/user.types";
import type {TeamPostCreateRequest, TeamPostResponse, TeamPostVoteValue} from "../../../types/teampost.types";
import {TeamPostService} from "../services/teampost.service";
import {success} from "../../../utils/api-response";
import {Pageable} from "../../../types/common.types";
import UserModel from "../../user/models/user.model";

export class TeamPostController {
    static async create(req: UserRequest, res: Response, next: NextFunction): Promise<Response> {
        const request = req.body as TeamPostCreateRequest;
        const response: TeamPostResponse = await TeamPostService.create(req.user!._id, request);
        return success(res, 201, 'Team post created successfully', response);
    }

    static async getAll(req: UserRequest, res: Response, next: NextFunction): Promise<Response> {
        let page = parseInt(String(req.query.page ?? '1'), 10);
        let size = parseInt(String(req.query.size ?? '30'), 10);
        if (!Number.isFinite(page) || page < 1) page = 1;
        if (!Number.isFinite(size) || size < 1) size = 30;
        size = Math.min(Math.max(size, 1), 100);

        const requesterId = req.user?._id ? String(req.user._id) : undefined;
        const response: Pageable<TeamPostResponse> = await TeamPostService.getAll(page, size, requesterId);
        return success(res, 200, 'Team posts retrieved successfully', response);
    }

    static async remove(req: UserRequest, res: Response, next: NextFunction): Promise<Response> {
        const user = await UserModel.findById(req.user!._id);
        const role = user ? user.role : 'mahasiswa';
        await TeamPostService.remove(String(req.params.id), req.user!._id, role);
        return success(res, 200, 'Team post deleted successfully', {id: req.params.id});
    }

    /** POST /api/teamposts/:id/vote — vote naik (1) atau turun (-1); klik ulang = batalkan vote. */
    static async vote(req: UserRequest, res: Response, next: NextFunction): Promise<Response> {
        const value = req.body?.value as TeamPostVoteValue;
        const result = await TeamPostService.vote(String(req.params.id), req.user!._id, value);
        return success(res, 200, 'Vote recorded successfully', result);
    }
}
