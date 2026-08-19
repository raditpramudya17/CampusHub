import {Types} from "mongoose";
import CommentModel from "../models/comment.model";
import CompetitionModel from "../../competition/models/competition.model";
import {commentResponse} from "../responses/comment.response";
import type {CommentResponse} from "../../../types/comment.types";
import {Validation} from "../../../validations/validation";
import {CommentValidation} from "../validations/comment.validation";
import {Pageable} from "../../../types/common.types";
import {ResponseError} from "../../../errors/response-error";

export class CommentService {
    static async create(authorId: Types.ObjectId, competitionId: string, text: string): Promise<CommentResponse> {
        const validated = Validation.validate(CommentValidation.CREATE, {competitionId, text});
        if (!Types.ObjectId.isValid(validated.competitionId)) {
            throw new ResponseError(404, 'Competition not found');
        }
        const competition = await CompetitionModel.findById(validated.competitionId);
        if (!competition) throw new ResponseError(404, 'Competition not found');

        const comment = new CommentModel({competition: validated.competitionId, author: authorId, text: validated.text});
        await comment.save();
        await comment.populate('author', 'username email');
        return commentResponse(comment);
    }

    static async getByCompetition(competitionId: string, page: number, size: number): Promise<Pageable<CommentResponse>> {
        if (!Types.ObjectId.isValid(competitionId)) {
            return {data: [], paging: {page, size, total: 0}};
        }
        const skip = Math.max(0, (page - 1) * size);
        const query = {competition: competitionId};
        const total = await CommentModel.countDocuments(query);
        const comments = await CommentModel
            .find(query)
            .sort({createdAt: 1})
            .skip(skip)
            .limit(size)
            .populate('author', 'username email');
        return {data: comments.map(commentResponse), paging: {page, size, total}};
    }

    static async remove(id: string, userId: Types.ObjectId, userRole: string): Promise<void> {
        if (!Types.ObjectId.isValid(id)) throw new ResponseError(404, 'Comment not found');
        const comment = await CommentModel.findById(id);
        if (!comment) throw new ResponseError(404, 'Comment not found');
        if (String(comment.author) !== String(userId) && userRole !== 'admin') {
            throw new ResponseError(403, 'Forbidden: not allowed to delete this comment');
        }
        await CommentModel.deleteOne({_id: id});
    }
}
