/**
 * Tipe-tipe yang berkaitan dengan komentar pada teampost (papan "Cari Rekan Tim").
 */
import {Types} from "mongoose";

export interface TeamPostCommentTypes {
    _id: Types.ObjectId;
    teamPost: Types.ObjectId;
    author: Types.ObjectId;
    text: string;
    createdAt: Date;
}

export interface TeamPostCommentResponse {
    id: string;
    teamPostId: string;
    text: string;
    author: string;
    authorId: string;
    createdAt: Date;
}
