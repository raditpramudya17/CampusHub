/**
 * Model Competition — informasi lomba yang diunggah pengguna.
 * Setiap lomba baru berstatus "pending" dan hanya tampil di feed publik
 * setelah disetujui admin (fitur moderasi CampusHub).
 */
import mongoose from "../../../../mongoose/config";
import {Schema} from "mongoose";
import type {CompetitionTypes} from "../../../types/competition.types";

const competitionSchema = new mongoose.Schema<CompetitionTypes>({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ["akademik", "teknologi", "seni", "olahraga", "bisnis", "lainnya"],
        required: true
    },
    // Penyelenggara lomba (UKM, fakultas, atau pihak eksternal)
    organizer: {
        type: String,
        required: true
    },
    registrationDeadline: {
        type: Date,
        required: true
    },
    eventDate: {
        type: Date,
        default: null
    },
    prize: {
        type: String,
        default: null
    },
    requirements: {
        type: String,
        default: null
    },
    registrationLink: {
        type: String,
        default: null
    },
    posterUrl: {
        type: String,
        default: null
    },
    fee: {
        type: String,
        enum: ["gratis", "berbayar"],
        default: null
    },
    format: {
        type: String,
        enum: ["online", "offline", "hybrid"],
        default: null
    },
    level: {
        type: String,
        enum: ["kampus", "regional", "nasional", "internasional"],
        default: null
    },
    tags: {
        type: [String],
        default: []
    },
    location: {
        type: String,
        default: null
    },
    // --- Field moderasi ---
    // Pengunggah lomba
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Konten baru selalu pending; hanya approved yang tampil di feed publik
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    // Alasan penolakan dari admin (jika ditolak)
    rejectionReason: {
        type: String,
        default: null
    },
    // Jejak moderasi: siapa yang meninjau dan kapan
    reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    reviewedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
})

// Index untuk query feed: lomba approved diurutkan deadline terdekat
competitionSchema.index({ status: 1, registrationDeadline: 1 });
// Index full-text search: judul, deskripsi, penyelenggara (lihat CompetitionService.getAll)
competitionSchema.index({ title: 'text', description: 'text', organizer: 'text' });

const CompetitionModel = mongoose.model("Competition", competitionSchema);

export default CompetitionModel;
