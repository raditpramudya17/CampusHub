import type {NextFunction, Response} from "express";
import type {UserRequest} from "../../../types/user.types";
import type {TeamPostCommentResponse} from "../../../types/teampostComment.types";
import {TeamPostCommentService} from "../services/teampost-comment.service";
import {success} from "../../../utils/api-response";
import {Pageable} from "../../../types/common.types";
import UserModel from "../../user/models/user.model";

export class TeamPostCommentController {
    /** GET /api/teamposts/:id/comments */
    static async getByTeamPost(req: UserRequest, res: Response, next: NextFunction): Promise<Response> {
        let page = parseInt(String(req.query.page ?? '1'), 10);
        let size = parseInt(String(req.query.size ?? '50'), 10);
        if (!Number.isFinite(page) || page < 1) page = 1;
        if (!Number.isFinite(size) || size < 1) size = 50;
        size = Math.min(Math.max(size, 1), 100);

        const response: Pageable<TeamPostCommentResponse> = await TeamPostCommentService.getByTeamPost(String(req.params.id), page, size);
        return success(res, 200, 'Comments retrieved successfully', response);
    }

    /** POST /api/teamposts/:id/comments */
    static async create(req: UserRequest, res: Response, next: NextFunction): Promise<Response> {
        const {text} = req.body as { text: string };
        const response: TeamPostCommentResponse = await TeamPostCommentService.create(req.user!._id, String(req.params.id), text);
        return success(res, 201, 'Comment posted successfully', response);
    }

    /** DELETE /api/teamposts/comments/:commentId */
    static async remove(req: UserRequest, res: Response, next: NextFunction): Promise<Response> {
        const user = await UserModel.findById(req.user!._id);
        const role = user ? user.role : 'mahasiswa';
        await TeamPostCommentService.remove(String(req.params.commentId), req.user!._id, role);
        return success(res, 200, 'Comment deleted successfully', {id: req.params.commentId});
    }
}
