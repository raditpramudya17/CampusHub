/**
 * Tipe-tipe yang berkaitan dengan teampost (papan "Cari Rekan Tim").
 * Sengaja tanpa moderasi/status — papan ringan, akuntabilitas cukup lewat wajib login untuk posting.
 */
import {Types} from "mongoose";

export type TeamPostVoteValue = 1 | -1;

export interface TeamPostTypes {
    _id: Types.ObjectId;
    competition: Types.ObjectId | null;
    title: string;
    description: string;
    rolesNeeded: string;
    contactInfo: string;
    author: Types.ObjectId;
    createdAt: Date;
}

export interface TeamPostCreateRequest {
    competition?: string;
    title: string;
    description: string;
    rolesNeeded: string;
    contactInfo: string;
}

export interface TeamPostResponse {
    id: string;
    competitionId: string | null;
    competitionTitle: string | null;
    title: string;
    description: string;
    rolesNeeded: string;
    contactInfo: string;
    author: string;
    createdAt: Date;
    score: number;
    myVote: TeamPostVoteValue | null;
    commentCount: number;
}

/** Bentuk dokumen TeamPostVote — satu vote (naik/turun) milik satu user untuk satu teampost. */
export interface TeamPostVoteTypes {
    _id: Types.ObjectId;
    teamPost: Types.ObjectId;
    user: Types.ObjectId;
    value: TeamPostVoteValue;
}
