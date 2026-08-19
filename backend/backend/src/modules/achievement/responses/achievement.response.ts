/**
 * Fungsi pembentuk response modul achievement.
 * rejectionReason hanya dikirim ke pemilik laporan sendiri atau admin (sama seperti competition).
 */
import type {AchievementResponse, AchievementTypes} from "../../../types/achievement.types";

export const achievementResponse = (
    achievement: AchievementTypes,
    viewer?: { id?: string; role?: string }
): AchievementResponse => {
    let authorLabel: string;
    let authorId: string | null = null;
    try {
        const author = (achievement as any).author;
        if (typeof author === 'object' && author !== null) {
            authorLabel = (author.username as string) || (author.email as string) || achievement._id.toString();
            authorId = author._id ? author._id.toString() : null;
        } else {
            authorLabel = author?.toString?.() ?? '';
            authorId = author?.toString?.() ?? null;
        }
    } catch (e) {
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
    }
}
