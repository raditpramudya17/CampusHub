import type {TeamPostResponse, TeamPostTypes, TeamPostVoteValue} from "../../../types/teampost.types";

/** Info voting/komentar per post — dihitung terpisah lewat agregasi (lihat TeamPostService.getAll). */
export interface TeamPostExtras {
    score: number;
    myVote: TeamPostVoteValue | null;
    commentCount: number;
}

export const teamPostResponse = (post: TeamPostTypes, extras: TeamPostExtras = {score: 0, myVote: null, commentCount: 0}): TeamPostResponse => {
    let authorLabel = '';
    try {
        const author = (post as any).author;
        authorLabel = typeof author === 'object' && author !== null
            ? ((author.username as string) || (author.email as string) || '')
            : (author?.toString?.() ?? '');
    } catch (e) {
        authorLabel = '';
    }

    let competitionId: string | null = null;
    let competitionTitle: string | null = null;
    try {
        const competition = (post as any).competition;
        if (typeof competition === 'object' && competition !== null) {
            competitionId = competition._id.toString();
            competitionTitle = competition.title;
        } else if (competition) {
            competitionId = competition.toString();
        }
    } catch (e) {
        // biarkan null jika lomba terkait sudah dihapus
    }

    return {
        id: post._id.toString(),
        competitionId,
        competitionTitle,
        title: post.title,
        description: post.description,
        rolesNeeded: post.rolesNeeded,
        contactInfo: post.contactInfo,
        author: authorLabel,
        createdAt: post.createdAt,
        score: extras.score,
        myVote: extras.myVote,
        commentCount: extras.commentCount
    }
}
