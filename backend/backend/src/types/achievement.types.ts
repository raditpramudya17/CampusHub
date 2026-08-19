/**
 * Tipe-tipe yang berkaitan dengan achievement (prestasi mahasiswa/tim — Wall of Fame).
 */
import {Types} from "mongoose";
import type {ModerationStatus} from "./competition.types";

/** Bentuk dokumen Achievement di database. */
export interface AchievementTypes {
    _id: Types.ObjectId;
    title: string;
    teamOrUser: string;
    rank: string;
    year: number;
    prodi: string;
    proofUrl: string | null;
    repoUrl: string | null;
    demoUrl: string | null;
    author: Types.ObjectId;
    status: ModerationStatus;
    rejectionReason: string | null;
    reviewedBy: Types.ObjectId | null;
    reviewedAt: Date | null;
    createdAt: Date;
}

/** Body pelaporan prestasi (input dari user). */
export interface AchievementCreateRequest {
    title: string;
    teamOrUser: string;
    rank: string;
    year: number;
    prodi: string;
    proofUrl?: string;
    repoUrl?: string;
    demoUrl?: string;
}

/** Bentuk response achievement yang dikirim ke client. */
export interface AchievementResponse {
    id: string;
    title: string;
    teamOrUser: string;
    rank: string;
    year: number;
    prodi: string;
    proofUrl: string | null;
    repoUrl: string | null;
    demoUrl: string | null;
    status: ModerationStatus;
    rejectionReason: string | null;
    author: string;
    createdAt: Date;
}
