"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.achievementResponse = void 0;
const achievementResponse = (achievement, viewer) => {
    let authorLabel;
    let authorId = null;
    try {
        const author = achievement.author;
        if (typeof author === 'object' && author !== null) {
            authorLabel = author.username || author.email || achievement._id.toString();
            authorId = author._id ? author._id.toString() : null;
        }
        else {
            authorLabel = author?.toString?.() ?? '';
            authorId = author?.toString?.() ?? null;
        }
    }
    catch (e) {
        authorLabel = achievement._id.toString();
    }
    const isOwnerOrAdmin = !!viewer && (viewer.role === 'admin' || (!!authorId && viewer.id === authorId));
    return {
        id: achievement._id.toString(),
        title: achievement.title,
        teamOrUser: achievement.teamOrUser,
        rank: achievement.rank,
        year: achievement.year,
        prodi: achievement.prodi,
        proofUrl: achievement.proofUrl ?? null,
        repoUrl: achievement.repoUrl ?? null,
        demoUrl: achievement.demoUrl ?? null,
        status: achievement.status,
        rejectionReason: isOwnerOrAdmin ? (achievement.rejectionReason ?? null) : null,
        author: authorLabel,
        createdAt: achievement.createdAt
    };
};
exports.achievementResponse = achievementResponse;
