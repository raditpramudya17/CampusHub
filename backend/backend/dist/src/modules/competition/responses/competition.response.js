"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.competitionAuditResponse = exports.competitionResponse = void 0;
const competitionResponse = (competition, viewer) => {
    // author may be populated (object) or just an ObjectId string — prefer username when populated
    let authorLabel;
    let authorId = null;
    let authorRole = null;
    try {
        const author = competition.author;
        if (typeof author === 'object' && author !== null) {
            authorLabel = author.username || author.email || competition._id.toString();
            authorId = author._id ? author._id.toString() : null;
            authorRole = author.role ?? null;
        }
        else {
            authorLabel = author?.toString?.() ?? '';
            authorId = author?.toString?.() ?? null;
        }
    }
    catch (e) {
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
    };
};
exports.competitionResponse = competitionResponse;
/** Baris audit moderasi (admin-only): sama seperti competitionResponse + siapa/kapan ditinjau. */
const competitionAuditResponse = (competition) => {
    const base = (0, exports.competitionResponse)(competition, { role: 'admin' });
    const reviewedBy = competition.reviewedBy;
    const reviewedByUsername = reviewedBy && typeof reviewedBy === 'object' ? (reviewedBy.username ?? null) : null;
    return {
        ...base,
        reviewedByUsername,
        reviewedAt: competition.reviewedAt ?? null
    };
};
exports.competitionAuditResponse = competitionAuditResponse;
