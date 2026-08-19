"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamPostService = void 0;
const mongoose_1 = require("mongoose");
const teampost_model_1 = __importDefault(require("../models/teampost.model"));
const teampost_vote_model_1 = __importDefault(require("../models/teampost-vote.model"));
const teampost_comment_model_1 = __importDefault(require("../models/teampost-comment.model"));
const teampost_response_1 = require("../responses/teampost.response");
const validation_1 = require("../../../validations/validation");
const teampost_validation_1 = require("../validations/teampost.validation");
const response_error_1 = require("../../../errors/response-error");
class TeamPostService {
    static async create(authorId, request) {
        const validated = validation_1.Validation.validate(teampost_validation_1.TeamPostValidation.CREATE, request);
        const post = new teampost_model_1.default({ ...validated, author: authorId });
        await post.save();
        await post.populate('author', 'username email');
        return (0, teampost_response_1.teamPostResponse)(post);
    }
    static async getAll(page, size, requesterId) {
        const skip = Math.max(0, (page - 1) * size);
        const total = await teampost_model_1.default.countDocuments();
        const posts = await teampost_model_1.default
            .find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(size)
            .populate('author', 'username email')
            .populate('competition', 'title');
        const extrasByPostId = await this.getExtrasFor(posts.map(p => p._id), requesterId);
        return {
            data: posts.map(p => (0, teampost_response_1.teamPostResponse)(p, extrasByPostId.get(String(p._id)))),
            paging: { page, size, total }
        };
    }
    /** Hitung score (jumlah vote), vote milik requester, dan jumlah komentar untuk sekumpulan teampost sekaligus. */
    static async getExtrasFor(postIds, requesterId) {
        const map = new Map();
        if (postIds.length === 0)
            return map;
        const [scoreAgg, commentAgg, myVotes] = await Promise.all([
            teampost_vote_model_1.default.aggregate([
                { $match: { teamPost: { $in: postIds } } },
                { $group: { _id: '$teamPost', score: { $sum: '$value' } } }
            ]),
            teampost_comment_model_1.default.aggregate([
                { $match: { teamPost: { $in: postIds } } },
                { $group: { _id: '$teamPost', count: { $sum: 1 } } }
            ]),
            requesterId && mongoose_1.Types.ObjectId.isValid(requesterId)
                ? teampost_vote_model_1.default.find({ teamPost: { $in: postIds }, user: requesterId })
                : Promise.resolve([])
        ]);
        for (const id of postIds)
            map.set(String(id), { score: 0, myVote: null, commentCount: 0 });
        scoreAgg.forEach((s) => {
            const entry = map.get(String(s._id));
            if (entry)
                entry.score = s.score;
        });
        commentAgg.forEach((c) => {
            const entry = map.get(String(c._id));
            if (entry)
                entry.commentCount = c.count;
        });
        myVotes.forEach((v) => {
            const entry = map.get(String(v.teamPost));
            if (entry)
                entry.myVote = v.value;
        });
        return map;
    }
    static async remove(id, userId, userRole) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            throw new response_error_1.ResponseError(404, 'Team post not found');
        const post = await teampost_model_1.default.findById(id);
        if (!post)
            throw new response_error_1.ResponseError(404, 'Team post not found');
        if (String(post.author) !== String(userId) && userRole !== 'admin') {
            throw new response_error_1.ResponseError(403, 'Forbidden: not allowed to delete this post');
        }
        await teampost_model_1.default.deleteOne({ _id: id });
        await teampost_vote_model_1.default.deleteMany({ teamPost: id });
        await teampost_comment_model_1.default.deleteMany({ teamPost: id });
    }
    /**
     * Vote naik/turun. Klik ulang tombol yang sama = toggle off (hapus vote).
     * Klik tombol berlawanan = ganti arah vote.
     */
    static async vote(id, userId, value) {
        const validated = validation_1.Validation.validate(teampost_validation_1.TeamPostValidation.VOTE, { value });
        if (!mongoose_1.Types.ObjectId.isValid(id))
            throw new response_error_1.ResponseError(404, 'Team post not found');
        const post = await teampost_model_1.default.findById(id);
        if (!post)
            throw new response_error_1.ResponseError(404, 'Team post not found');
        const existing = await teampost_vote_model_1.default.findOne({ teamPost: id, user: userId });
        if (existing && existing.value === validated.value) {
            await teampost_vote_model_1.default.deleteOne({ _id: existing._id });
        }
        else if (existing) {
            existing.value = validated.value;
            await existing.save();
        }
        else {
            await teampost_vote_model_1.default.create({ teamPost: id, user: userId, value: validated.value });
        }
        const scoreAgg = await teampost_vote_model_1.default.aggregate([
            { $match: { teamPost: post._id } },
            { $group: { _id: null, score: { $sum: '$value' } } }
        ]);
        const myVoteDoc = await teampost_vote_model_1.default.findOne({ teamPost: id, user: userId });
        return { score: scoreAgg[0]?.score ?? 0, myVote: myVoteDoc ? myVoteDoc.value : null };
    }
}
exports.TeamPostService = TeamPostService;
