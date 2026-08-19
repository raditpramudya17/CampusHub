/**
 * Model TeamPostComment — diskusi/tanya-jawab ringan per pengumuman cari tim.
 */
import mongoose from "../../../../mongoose/config";
import {Schema} from "mongoose";
import type {TeamPostCommentTypes} from "../../../types/teampostComment.types";

const teamPostCommentSchema = new mongoose.Schema<TeamPostCommentTypes>({
    teamPost: {
        type: Schema.Types.ObjectId,
        ref: 'TeamPost',
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true
    }
}, {
    timestamps: {createdAt: true, updatedAt: false}
})

teamPostCommentSchema.index({teamPost: 1, createdAt: 1});

const TeamPostCommentModel = mongoose.model("TeamPostComment", teamPostCommentSchema);

export default TeamPostCommentModel;
