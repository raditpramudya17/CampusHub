import type {NextFunction, Response} from "express";
import type {UserRequest} from "../../../types/user.types";
import type {CommentResponse} from "../../../types/comment.types";
import {CommentService} from "../services/comment.service";
import {success} from "../../../utils/api-response";
import {Pageable} from "../../../types/common.types";
import {ResponseError} from "../../../errors/response-error";
import UserModel from "../../user/models/user.model";

export class CommentController {
    static async create(req: UserRequest, res: Response, next: NextFunction): Promise<Response> {
        const {competitionId, text} = req.body as { competitionId: string; text: string };
        const response: CommentResponse = await CommentService.create(req.user!._id, competitionId, text);
        return success(res, 201, 'Comment posted successfully', response);
    }

    static async getByCompetition(req: UserRequest, res: Response, next: NextFunction): Promise<Response> {
        const competitionId = String(req.query.competitionId ?? '');
        if (!competitionId) throw new ResponseError(400, 'competitionId is required');

        let page = parseInt(String(req.query.page ?? '1'), 10);
        let size = parseInt(String(req.query.size ?? '50'), 10);
        if (!Number.isFinite(page) || page < 1) page = 1;
        if (!Number.isFinite(size) || size < 1) size = 50;
        size = Math.min(Math.max(size, 1), 100);

        const response: Pageable<CommentResponse> = await CommentService.getByCompetition(competitionId, page, size);
        return success(res, 200, 'Comments retrieved successfully', response);
    }

    static async remove(req: UserRequest, res: Response, next: NextFunction): Promise<Response> {
        const user = await UserModel.findById(req.user!._id);
        const role = user ? user.role : 'mahasiswa';
        await CommentService.remove(String(req.params.id), req.user!._id, role);
        return success(res, 200, 'Comment deleted successfully', {id: req.params.id});
    }
}
