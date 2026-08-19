import {Types} from "mongoose";
import TeamPostModel from "../models/teampost.model";
import TeamPostVoteModel from "../models/teampost-vote.model";
import TeamPostCommentModel from "../models/teampost-comment.model";
import {teamPostResponse, TeamPostExtras} from "../responses/teampost.response";
import type {TeamPostCreateRequest, TeamPostResponse, TeamPostVoteValue} from "../../../types/teampost.types";
import {Validation} from "../../../validations/validation";
import {TeamPostValidation} from "../validations/teampost.validation";
import {Pageable} from "../../../types/common.types";
import {ResponseError} from "../../../errors/response-error";

export class TeamPostService {
    static async create(authorId: Types.ObjectId, request: TeamPostCreateRequest): Promise<TeamPostResponse> {
        const validated: TeamPostCreateRequest = Validation.validate(TeamPostValidation.CREATE, request);
        const post = new TeamPostModel({...validated, author: authorId});
        await post.save();
        await post.populate('author', 'username email');
        return teamPostResponse(post);
    }

    static async getAll(page: number, size: number, requesterId?: string): Promise<Pageable<TeamPostResponse>> {
        const skip = Math.max(0, (page - 1) * size);
        const total = await TeamPostModel.countDocuments();
        const posts = await TeamPostModel
            .find()
            .sort({createdAt: -1})
            .skip(skip)
            .limit(size)
            .populate('author', 'username email')
            .populate('competition', 'title');

        const extrasByPostId = await this.getExtrasFor(posts.map(p => p._id), requesterId);

        return {
            data: posts.map(p => teamPostResponse(p, extrasByPostId.get(String(p._id)))),
            paging: {page, size, total}
        };
    }

    /** Hitung score (jumlah vote), vote milik requester, dan jumlah komentar untuk sekumpulan teampost sekaligus. */
    private static async getExtrasFor(postIds: Types.ObjectId[], requesterId?: string): Promise<Map<string, TeamPostExtras>> {
        const map = new Map<string, TeamPostExtras>();
        if (postIds.length === 0) return map;

        const [scoreAgg, commentAgg, myVotes] = await Promise.all([
            TeamPostVoteModel.aggregate([
                {$match: {teamPost: {$in: postIds}}},
                {$group: {_id: '$teamPost', score: {$sum: '$value'}}}
            ]),
            TeamPostCommentModel.aggregate([
                {$match: {teamPost: {$in: postIds}}},
                {$group: {_id: '$teamPost', count: {$sum: 1}}}
            ]),
            requesterId && Types.ObjectId.isValid(requesterId)
                ? TeamPostVoteModel.find({teamPost: {$in: postIds}, user: requesterId})
                : Promise.resolve([])
        ]);

        for (const id of postIds) map.set(String(id), {score: 0, myVote: null, commentCount: 0});
        scoreAgg.forEach((s: any) => {
            const entry = map.get(String(s._id));
            if (entry) entry.score = s.score;
        });
        commentAgg.forEach((c: any) => {
            const entry = map.get(String(c._id));
            if (entry) entry.commentCount = c.count;
        });
        (myVotes as any[]).forEach((v) => {
            const entry = map.get(String(v.teamPost));
            if (entry) entry.myVote = v.value;
        });

        return map;
    }

    static async remove(id: string, userId: Types.ObjectId, userRole: string): Promise<void> {
        if (!Types.ObjectId.isValid(id)) throw new ResponseError(404, 'Team post not found');
        const post = await TeamPostModel.findById(id);
        if (!post) throw new ResponseError(404, 'Team post not found');
        if (String(post.author) !== String(userId) && userRole !== 'admin') {
            throw new ResponseError(403, 'Forbidden: not allowed to delete this post');
        }
        await TeamPostModel.deleteOne({_id: id});
        await TeamPostVoteModel.deleteMany({teamPost: id});
        await TeamPostCommentModel.deleteMany({teamPost: id});
    }

    /**
     * Vote naik/turun. Klik ulang tombol yang sama = toggle off (hapus vote).
     * Klik tombol berlawanan = ganti arah vote.
     */
    static async vote(id: string, userId: Types.ObjectId, value: TeamPostVoteValue): Promise<{ score: number; myVote: TeamPostVoteValue | null }> {
        const validated = Validation.validate(TeamPostValidation.VOTE, {value});
        if (!Types.ObjectId.isValid(id)) throw new ResponseError(404, 'Team post not found');
        const post = await TeamPostModel.findById(id);
        if (!post) throw new ResponseError(404, 'Team post not found');

        const existing = await TeamPostVoteModel.findOne({teamPost: id, user: userId});
        if (existing && existing.value === validated.value) {
            await TeamPostVoteModel.deleteOne({_id: existing._id});
        } else if (existing) {
            existing.value = validated.value;
            await existing.save();
        } else {
            await TeamPostVoteModel.create({teamPost: id, user: userId, value: validated.value});
        }

        const scoreAgg = await TeamPostVoteModel.aggregate([
            {$match: {teamPost: post._id}},
            {$group: {_id: null, score: {$sum: '$value'}}}
        ]);
        const myVoteDoc = await TeamPostVoteModel.findOne({teamPost: id, user: userId});

        return {score: scoreAgg[0]?.score ?? 0, myVote: myVoteDoc ? myVoteDoc.value : null};
    }
}
