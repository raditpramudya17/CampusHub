/**
 * Tipe-tipe yang berkaitan dengan comment (diskusi/tanya-jawab per lomba).
 */
import {Types} from "mongoose";

export interface CommentTypes {
    _id: Types.ObjectId;
    competition: Types.ObjectId;
    author: Types.ObjectId;
    text: string;
    createdAt: Date;
}

export interface CommentCreateRequest {
    competitionId: string;
    text: string;
}

export interface CommentResponse {
    id: string;
    competitionId: string;
    text: string;
    author: string;
    authorId: string;
    createdAt: Date;
}
