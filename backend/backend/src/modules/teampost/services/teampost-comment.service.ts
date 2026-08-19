import {Types} from "mongoose";
import TeamPostCommentModel from "../models/teampost-comment.model";
import TeamPostModel from "../models/teampost.model";
import {teamPostCommentResponse} from "../responses/teampost-comment.response";
import type {TeamPostCommentResponse} from "../../../types/teampostComment.types";
import {Validation} from "../../../validations/validation";
import {TeamPostValidation} from "../validations/teampost.validation";
import {Pageable} from "../../../types/common.types";
import {ResponseError} from "../../../errors/response-error";

export class TeamPostCommentService {
    static async create(authorId: Types.ObjectId, teamPostId: string, text: string): Promise<TeamPostCommentResponse> {
        const validated = Validation.validate(TeamPostValidation.COMMENT_CREATE, {text});
        if (!Types.ObjectId.isValid(teamPostId)) {
            throw new ResponseError(404, 'Team post not found');
        }
        const post = await TeamPostModel.findById(teamPostId);
        if (!post) throw new ResponseError(404, 'Team post not found');

        const comment = new TeamPostCommentModel({teamPost: teamPostId, author: authorId, text: validated.text});
        await comment.save();
        await comment.populate('author', 'username email');
        return teamPostCommentResponse(comment);
    }

    static async getByTeamPost(teamPostId: string, page: number, size: number): Promise<Pageable<TeamPostCommentResponse>> {
        if (!Types.ObjectId.isValid(teamPostId)) {
            return {data: [], paging: {page, size, total: 0}};
        }
        const skip = Math.max(0, (page - 1) * size);
        const query = {teamPost: teamPostId};
        const total = await TeamPostCommentModel.countDocuments(query);
        const comments = await TeamPostCommentModel
            .find(query)
            .sort({createdAt: 1})
            .skip(skip)
            .limit(size)
            .populate('author', 'username email');
        return {data: comments.map(teamPostCommentResponse), paging: {page, size, total}};
    }

    static async remove(id: string, userId: Types.ObjectId, userRole: string): Promise<void> {
        if (!Types.ObjectId.isValid(id)) throw new ResponseError(404, 'Comment not found');
        const comment = await TeamPostCommentModel.findById(id);
        if (!comment) throw new ResponseError(404, 'Comment not found');
        if (String(comment.author) !== String(userId) && userRole !== 'admin') {
            throw new ResponseError(403, 'Forbidden: not allowed to delete this comment');
        }
        await TeamPostCommentModel.deleteOne({_id: id});
    }
}
