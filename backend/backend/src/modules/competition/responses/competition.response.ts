/**
 * Fungsi pembentuk response modul competition.
 * Field internal moderasi (reviewedBy) tidak dikirim ke pengunggah biasa.
 * rejectionReason hanya dikirim ke pemilik lomba sendiri atau admin (lihat `viewer`).
 */
import type {CompetitionAuditResponse, CompetitionResponse, CompetitionTypes} from "../../../types/competition.types";

export const competitionResponse = (
    competition: CompetitionTypes,
    viewer?: { id?: string; role?: string }
): CompetitionResponse => {
    // author may be populated (object) or just an ObjectId string — prefer username when populated
    let authorLabel: string;
    let authorId: string | null = null;
    let authorRole: string | null = null;
    try {
        const author = (competition as any).author;
        if (typeof author === 'object' && author !== null) {
            authorLabel = (author.username as string) || (author.email as string) || competition._id.toString();
            authorId = author._id ? author._id.toString() : null;
            authorRole = (author.role as string) ?? null;
        } else {
            authorLabel = author?.toString?.() ?? '';
            authorId = author?.toString?.() ?? null;
        }
    } catch (e) {
        authorLabel = competition._id.toString();
    }

    const isOwnerOrAdmin = !!viewer && (viewer.role === 'admin' || (!!authorId && viewer.id === authorId));

    return {
        id: competition._id.toString(),
        title: competition.title,
        description: competition.description,
        category: competition.category,
        organizer: competition.organizer,
        registrationDeadline: competition.registrationDeadline,
        eventDate: competition.eventDate,
        prize: competition.prize,
        requirements: competition.requirements,
        registrationLink: competition.registrationLink,
        posterUrl: competition.posterUrl ?? null,
        fee: competition.fee ?? null,
        format: competition.format ?? null,
        level: competition.level ?? null,
        tags: competition.tags ?? [],
        location: competition.location ?? null,
        status: competition.status,
        rejectionReason: isOwnerOrAdmin ? (competition.rejectionReason ?? null) : null,
        author: authorLabel,
        authorRole,
        createdAt: competition.createdAt
    }
}

/** Baris audit moderasi (admin-only): sama seperti competitionResponse + siapa/kapan ditinjau. */
export const competitionAuditResponse = (competition: CompetitionTypes): CompetitionAuditResponse => {
    const base = competitionResponse(competition, { role: 'admin' });
    const reviewedBy = (competition as any).reviewedBy;
    const reviewedByUsername = reviewedBy && typeof reviewedBy === 'object' ? (reviewedBy.username ?? null) : null;
    return {
        ...base,
        reviewedByUsername,
        reviewedAt: competition.reviewedAt ?? null
    };
}
