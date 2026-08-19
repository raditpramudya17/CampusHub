"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Model TeamPostVote — satu vote (naik/turun) milik satu user untuk satu teampost.
 * Klik ulang tombol yang sama akan menghapus vote (toggle off) — lihat TeamPostService.vote.
 */
const config_1 = __importDefault(require("../../../../mongoose/config"));
const mongoose_1 = require("mongoose");
const teamPostVoteSchema = new config_1.default.Schema({
    teamPost: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'TeamPost',
        required: true
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
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
teamPostVoteSchema.index({ teamPost: 1, user: 1 }, { unique: true });
const TeamPostVoteModel = config_1.default.model("TeamPostVote", teamPostVoteSchema);
exports.default = TeamPostVoteModel;
