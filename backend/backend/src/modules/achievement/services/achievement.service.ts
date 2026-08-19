/**
 * AchievementService — logika bisnis modul achievement (Wall of Fame).
 * Aturan visibilitas status sama persis dengan CompetitionService.getAll —
 * lihat komentar di sana untuk penjelasan lengkap.
 */
import {Types} from "mongoose";
import AchievementModel from "../models/achievement.model";
import {achievementResponse} from "../responses/achievement.response";
import type {AchievementCreateRequest, AchievementResponse} from "../../../types/achievement.types";
import {Validation} from "../../../validations/validation";
import {AchievementValidation} from "../validations/achievement.validation";
import {Pageable} from "../../../types/common.types";
import {ResponseError} from "../../../errors/response-error";

const AUTHOR_SELECT = 'username email role';

export class AchievementService {
    static async create(authorId: Types.ObjectId, request: AchievementCreateRequest): Promise<AchievementResponse> {
        const createRequest: AchievementCreateRequest = Validation.validate(AchievementValidation.CREATE, request);
        const achievement = new AchievementModel({...createRequest, author: authorId});
        await achievement.save();
        return achievementResponse(achievement);
    }

    static async getAll(
        page: number,
        size: number,
        status?: string,
        requester?: { id: string; role: string }
    ): Promise<Pageable<AchievementResponse>> {
        const skip = Math.max(0, (Number(page) - 1) * Number(size));
        const limit = Math.max(1, Number(size));

        const requestedStatus = status ? String(status).toLowerCase() : '';
        const wantsNonApproved = requestedStatus.length > 0 && requestedStatus !== 'approved';
        const isAdmin = requester?.role === 'admin';

        const query: any = {};
        if (!wantsNonApproved) {
            query.status = 'approved';
        } else if (isAdmin) {
            if (requestedStatus !== 'all') query.status = requestedStatus;
        } else if (requester?.id) {
            query.author = requester.id;
            if (requestedStatus !== 'all') query.status = requestedStatus;
        } else {
            query.status = 'approved';
        }

        const total = await AchievementModel.countDocuments(query);
        const achievements = await AchievementModel
            .find(query)
            .sort({createdAt: -1})
            .skip(skip)
            .limit(limit)
            .populate('author', AUTHOR_SELECT);

        return {
            data: achievements.map(a => achievementResponse(a, requester)),
            paging: {page, size, total}
        };
    }

    static async approve(id: string, adminId: Types.ObjectId): Promise<AchievementResponse> {
        const achievement = await this.findOrThrow(id);
        achievement.status = 'approved';
        achievement.rejectionReason = null;
        achievement.reviewedBy = adminId as any;
        achievement.reviewedAt = new Date();
        await achievement.save();
        await achievement.populate('author', AUTHOR_SELECT);
        return achievementResponse(achievement, {id: String(adminId), role: 'admin'});
    }

    static async reject(id: string, adminId: Types.ObjectId, rejectionReason: string): Promise<AchievementResponse> {
        const validated = Validation.validate(AchievementValidation.REJECT, {rejectionReason});
        const achievement = await this.findOrThrow(id);
        achievement.status = 'rejected';
        achievement.rejectionReason = validated.rejectionReason;
        achievement.reviewedBy = adminId as any;
        achievement.reviewedAt = new Date();
        await achievement.save();
        await achievement.populate('author', AUTHOR_SELECT);
        return achievementResponse(achievement, {id: String(adminId), role: 'admin'});
    }

    private static async findOrThrow(id: string) {
        if (!Types.ObjectId.isValid(id)) {
            throw new ResponseError(404, 'Achievement not found');
        }
        const achievement = await AchievementModel.findById(id);
        if (!achievement) {
            throw new ResponseError(404, 'Achievement not found');
        }
        return achievement;
    }
}
