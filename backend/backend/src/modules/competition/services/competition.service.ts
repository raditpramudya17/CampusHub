/**
 * CompetitionService — logika bisnis modul competition.
 */
import {Types} from "mongoose";
import CompetitionModel from "../models/competition.model";
import BookmarkModel from "../../bookmark/models/bookmark.model";
import {NotificationService} from "../../notification/services/notification.service";
import {competitionAuditResponse, competitionResponse} from "../responses/competition.response";
import type {
    CompetitionAuditResponse,
    CompetitionCreateRequest,
    CompetitionResponse,
    CompetitionStatsResponse
} from "../../../types/competition.types";
import {Validation} from "../../../validations/validation";
import {CompetitionValidation} from "../validations/competition.validation";
import {Pageable} from "../../../types/common.types";
import {ResponseError} from "../../../errors/response-error";

const AUTHOR_SELECT = 'username email role';

export class CompetitionService {
    /**
     * Membuat lomba baru.
     * Status selalu "pending" — tidak tampil di feed publik sebelum disetujui admin.
     */
    static async create(authorId: Types.ObjectId, request: CompetitionCreateRequest): Promise<CompetitionResponse> {
        const createRequest: CompetitionCreateRequest = Validation.validate(CompetitionValidation.CREATE, request);

        const competition = new CompetitionModel({
            ...createRequest,
            author: authorId
            // status tidak di-set manual: default schema = "pending"
        });
        await competition.save();

        return competitionResponse(competition);
    }

    /**
     * Ambil kompetisi, sorted by registration deadline terdekat.
     * Pagination: skip berdasarkan (page - 1) * size.
     *
     * Visibilitas status non-"approved" (pending/rejected/all):
     * - Tamu (requester tidak ada): filter status diabaikan, selalu hanya "approved".
     * - User login biasa: filter dihormati TAPI dibatasi ke lomba miliknya sendiri
     *   (agar mahasiswa bisa memantau kirimannya sendiri tanpa bisa mengintip
     *   kiriman pending/rejected milik orang lain).
     * - Admin: filter dihormati apa adanya (perlu lihat semua untuk moderasi).
     */
    static async getAll(
        page: number,
        size: number,
        filters?: any,
        requester?: { id: string; role: string }
    ): Promise<Pageable<CompetitionResponse>> {
        const skip = Math.max(0, (Number(page) - 1) * Number(size));
        const limit = Math.max(1, Number(size));

        const requestedStatus = filters?.status ? String(filters.status).toLowerCase() : '';
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
            // tamu meminta status non-approved: tolak diam-diam, tetap tampilkan approved saja
            query.status = 'approved';
        }

        if (filters) {
            if (filters.q) {
                const q = String(filters.q).trim();
                if (q.length >= 3) {
                    // full-text search (butuh index text di competition.model.ts)
                    query.$text = {$search: q};
                } else if (q.length) {
                    // query pendek: $text MongoDB kurang andal untuk token < 3 karakter
                    query.$or = [
                        {title: {$regex: q, $options: 'i'}},
                        {description: {$regex: q, $options: 'i'}},
                        {organizer: {$regex: q, $options: 'i'}},
                    ];
                }
            }
            if (filters.category) {
                const cats = Array.isArray(filters.category) ? filters.category : String(filters.category).split(',');
                query.category = {$in: cats};
            }
            if (filters.fee) query.fee = String(filters.fee);
            if (filters.format) query.format = String(filters.format);
            if (filters.level) {
                const lvls = Array.isArray(filters.level) ? filters.level : String(filters.level).split(',');
                query.level = {$in: lvls};
            }
            if (filters.tags) {
                const tags = Array.isArray(filters.tags) ? filters.tags : String(filters.tags).split(',');
                query.tags = {$in: tags};
            }
            if (filters.tab && String(filters.tab) === 'closing') {
                const now = new Date();
                const until = new Date();
                until.setDate(now.getDate() + 7);
                query.registrationDeadline = {$gte: now, $lte: until};
            }
        }

        const total = await CompetitionModel.countDocuments(query);

        const competitions = await CompetitionModel
            .find(query)
            .sort({registrationDeadline: 1})
            .skip(skip)
            .limit(limit)
            .populate('author', AUTHOR_SELECT);

        const data = competitions.map(c => competitionResponse(c, requester));

        return {
            data,
            paging: {
                page,
                size,
                total
            }
        };
    }

    static async delete(id: string, userId: Types.ObjectId, userRole: string): Promise<void> {
        if (!Types.ObjectId.isValid(id)) {
            throw new ResponseError(404, 'Competition not found');
        }
        const competition = await CompetitionModel.findById(id);
        if (!competition) {
            throw new ResponseError(404, 'Competition not found');
        }
        const authorId = competition.author ? String(competition.author) : null;
        if (authorId !== String(userId) && userRole !== 'admin') {
            throw new ResponseError(403, 'Forbidden: not allowed to delete this competition');
        }
        await CompetitionModel.deleteOne({_id: id});
    }

    /** Setujui lomba (admin-only, dicek di controller/router). */
    static async approve(id: string, adminId: Types.ObjectId): Promise<CompetitionResponse> {
        const competition = await this.findOrThrow(id);
        competition.status = 'approved';
        competition.rejectionReason = null;
        competition.reviewedBy = adminId as any;
        competition.reviewedAt = new Date();
        await competition.save();
        await competition.populate('author', AUTHOR_SELECT);

        await NotificationService.create(
            competition.author,
            'submission_approved',
            'Lomba disetujui',
            `Kiriman lomba "${competition.title}" sudah disetujui dan tayang di feed publik.`,
            `#/papan?competition=${competition._id}`
        );
        await this.notifyInterestedUsers(competition);

        return competitionResponse(competition, {id: String(adminId), role: 'admin'});
    }

    /** Tolak lomba (admin-only, dicek di controller/router) — wajib menyertakan alasan. */
    static async reject(id: string, adminId: Types.ObjectId, rejectionReason: string): Promise<CompetitionResponse> {
        const validated = Validation.validate(CompetitionValidation.REJECT, {rejectionReason});
        const competition = await this.findOrThrow(id);
        competition.status = 'rejected';
        competition.rejectionReason = validated.rejectionReason;
        competition.reviewedBy = adminId as any;
        competition.reviewedAt = new Date();
        await competition.save();
        await competition.populate('author', AUTHOR_SELECT);

        await NotificationService.create(
            competition.author,
            'submission_rejected',
            'Lomba ditolak',
            `Kiriman lomba "${competition.title}" ditolak. Alasan: ${validated.rejectionReason}`,
            '#/kiriman'
        );

        return competitionResponse(competition, {id: String(adminId), role: 'admin'});
    }

    /**
     * Beri tahu user yang pernah bookmark lomba di kategori yang sama bahwa ada lomba baru.
     * Dipanggil setelah lomba disetujui (baru tayang di feed publik saat itu juga).
     */
    private static async notifyInterestedUsers(competition: any): Promise<void> {
        const interestedUserIds: string[] = await BookmarkModel.aggregate([
            {$lookup: {from: 'competitions', localField: 'competition', foreignField: '_id', as: 'comp'}},
            {$unwind: '$comp'},
            {$match: {'comp.category': competition.category, user: {$ne: competition.author}}},
            {$group: {_id: '$user'}}
        ]).then(rows => rows.map(r => String(r._id)));

        if (interestedUserIds.length === 0) return;
        await NotificationService.createMany(
            interestedUserIds,
            'new_in_category',
            'Lomba baru di kategori favoritmu',
            `Lomba baru "${competition.title}" baru saja tayang di kategori yang pernah kamu simpan.`,
            `#/papan?competition=${competition._id}`
        );
    }

    /** Riwayat moderasi (admin-only): semua lomba yang sudah pernah ditinjau, terbaru dulu. */
    static async getAudit(page: number, size: number): Promise<Pageable<CompetitionAuditResponse>> {
        const skip = Math.max(0, (Number(page) - 1) * Number(size));
        const limit = Math.max(1, Number(size));
        const query: any = {status: {$in: ['approved', 'rejected']}, reviewedAt: {$ne: null}};

        const total = await CompetitionModel.countDocuments(query);
        const competitions = await CompetitionModel
            .find(query)
            .sort({reviewedAt: -1})
            .skip(skip)
            .limit(limit)
            .populate('author', AUTHOR_SELECT)
            .populate('reviewedBy', 'username');

        return {
            data: competitions.map(c => competitionAuditResponse(c)),
            paging: {page, size, total}
        };
    }

    /** Statistik dashboard admin. */
    static async getStats(): Promise<CompetitionStatsResponse> {
        const [statusAgg, categoryAgg, monthAgg, topBookmarkedAgg] = await Promise.all([
            CompetitionModel.aggregate([{$group: {_id: '$status', count: {$sum: 1}}}]),
            CompetitionModel.aggregate([{$group: {_id: '$category', count: {$sum: 1}}}]),
            CompetitionModel.aggregate([
                {$group: {_id: {$dateToString: {format: '%Y-%m', date: '$createdAt'}}, count: {$sum: 1}}},
                {$sort: {_id: 1}}
            ]),
            BookmarkModel.aggregate([
                {$group: {_id: '$competition', bookmarkCount: {$sum: 1}}},
                {$sort: {bookmarkCount: -1}},
                {$limit: 5},
                {$lookup: {from: 'competitions', localField: '_id', foreignField: '_id', as: 'competition'}},
                {$unwind: '$competition'}
            ])
        ]);

        const byStatus: Record<string, number> = {};
        statusAgg.forEach((s: any) => byStatus[s._id] = s.count);
        const byCategory: Record<string, number> = {};
        categoryAgg.forEach((c: any) => byCategory[c._id] = c.count);
        const byMonth = monthAgg.map((m: any) => ({month: m._id, count: m.count}));
        const topBookmarked = topBookmarkedAgg.map((t: any) => ({
            id: t.competition._id.toString(),
            title: t.competition.title,
            bookmarkCount: t.bookmarkCount
        }));

        return {byStatus, byCategory, byMonth, topBookmarked};
    }

    private static async findOrThrow(id: string) {
        if (!Types.ObjectId.isValid(id)) {
            throw new ResponseError(404, 'Competition not found');
        }
        const competition = await CompetitionModel.findById(id);
        if (!competition) {
            throw new ResponseError(404, 'Competition not found');
        }
        return competition;
    }
}
