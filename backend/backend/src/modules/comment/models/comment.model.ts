/**
 * Model Comment — diskusi/tanya-jawab ringan per lomba.
 */
import mongoose from "../../../../mongoose/config";
import {Schema} from "mongoose";
import type {CommentTypes} from "../../../types/comment.types";

const commentSchema = new mongoose.Schema<CommentTypes>({
    competition: {
        type: Schema.Types.ObjectId,
        ref: 'Competition',
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

commentSchema.index({competition: 1, createdAt: 1});

const CommentModel = mongoose.model("Comment", commentSchema);

export default CommentModel;
