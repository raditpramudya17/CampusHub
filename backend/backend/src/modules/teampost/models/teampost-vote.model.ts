/**
 * Model TeamPostVote — satu vote (naik/turun) milik satu user untuk satu teampost.
 * Klik ulang tombol yang sama akan menghapus vote (toggle off) — lihat TeamPostService.vote.
 */
import mongoose from "../../../../mongoose/config";
import {Schema} from "mongoose";
import type {TeamPostVoteTypes} from "../../../types/teampost.types";

const teamPostVoteSchema = new mongoose.Schema<TeamPostVoteTypes>({
    teamPost: {
        type: Schema.Types.ObjectId,
        ref: 'TeamPost',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    value: {
        type: Number,
        enum: [1, -1],
        required: true
    }
});

// Satu user hanya bisa punya satu vote aktif per teampost
teamPostVoteSchema.index({teamPost: 1, user: 1}, {unique: true});

const TeamPostVoteModel = mongoose.model("TeamPostVote", teamPostVoteSchema);

export default TeamPostVoteModel;
