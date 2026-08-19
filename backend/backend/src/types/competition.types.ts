/**
 * Tipe-tipe yang berkaitan dengan lomba (competition).
 */
import {Types} from "mongoose";

/** Kategori lomba. */
export type CompetitionCategory = "akademik" | "teknologi" | "seni" | "olahraga" | "bisnis" | "lainnya";

/** Status moderasi: konten baru selalu pending, hanya approved yang tampil di feed. */
export type ModerationStatus = "pending" | "approved" | "rejected";

/** Biaya pendaftaran. */
export type CompetitionFee = "gratis" | "berbayar";

/** Format pelaksanaan. */
export type CompetitionFormat = "online" | "offline" | "hybrid";

/** Tingkat/skala lomba. */
export type CompetitionLevel = "kampus" | "regional" | "nasional" | "internasional";

/** Bentuk dokumen Competition di database. */
export interface CompetitionTypes {
    _id: Types.ObjectId;
    title: string;
    description: string;
    category: CompetitionCategory;
    organizer: string;
    registrationDeadline: Date;
    eventDate: Date | null;
    prize: string | null;
    requirements: string | null;
    registrationLink: string | null;
    posterUrl: string | null;
    fee: CompetitionFee | null;
    format: CompetitionFormat | null;
    level: CompetitionLevel | null;
    tags: string[];
    location: string | null;
    // Moderasi
    author: Types.ObjectId;
    status: ModerationStatus;
    rejectionReason: string | null;
    reviewedBy: Types.ObjectId | null;
    reviewedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

/** Body pembuatan lomba (input dari user). */
export interface CompetitionCreateRequest {
    title: string;
    description: string;
    category: CompetitionCategory;
    organizer: string;
    registrationDeadline: Date;
    eventDate?: Date;
    prize?: string;
    requirements?: string;
    registrationLink?: string;
    posterUrl?: string;
    fee?: CompetitionFee;
    format?: CompetitionFormat;
    level?: CompetitionLevel;
    tags?: string[];
    location?: string;
}

/** Body penolakan lomba oleh admin. */
export interface CompetitionRejectRequest {
    rejectionReason: string;
}

/** Bentuk response lomba yang dikirim ke client. */
export interface CompetitionResponse {
    id: string;
    title: string;
    description: string;
    category: CompetitionCategory;
    organizer: string;
    registrationDeadline: Date;
    eventDate: Date | null;
    prize: string | null;
    requirements: string | null;
    registrationLink: string | null;
    posterUrl: string | null;
    fee: CompetitionFee | null;
    format: CompetitionFormat | null;
    level: CompetitionLevel | null;
    tags: string[];
    location: string | null;
    status: ModerationStatus;
    /** Hanya terisi untuk pemilik lomba sendiri atau admin — lihat competitionResponse(). */
    rejectionReason: string | null;
    author: string;
    /** Role pemilik lomba (untuk badge "Terverifikasi Kampus" di frontend) — null jika tidak diketahui. */
    authorRole: string | null;
    createdAt: Date;
}

/** Baris audit moderasi (admin-only): lomba yang sudah ditinjau + siapa/kapan. */
export interface CompetitionAuditResponse extends CompetitionResponse {
    reviewedByUsername: string | null;
    reviewedAt: Date | null;
}

/** Statistik dashboard admin. */
export interface CompetitionStatsResponse {
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    byMonth: Array<{ month: string; count: number }>;
    topBookmarked: Array<{ id: string; title: string; bookmarkCount: number }>;
}
