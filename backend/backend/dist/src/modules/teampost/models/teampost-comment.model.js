"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Model TeamPostComment — diskusi/tanya-jawab ringan per pengumuman cari tim.
 */
const config_1 = __importDefault(require("../../../../mongoose/config"));
const mongoose_1 = require("mongoose");
const teamPostCommentSchema = new config_1.default.Schema({
    teamPost: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'TeamPost',
        required: true
    },
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true
    }
}, {
    timestamps: { createdAt: true, updatedAt: false }
});
teamPostCommentSchema.index({ teamPost: 1, createdAt: 1 });
const TeamPostCommentModel = config_1.default.model("TeamPostComment", teamPostCommentSchema);
exports.default = TeamPostCommentModel;
