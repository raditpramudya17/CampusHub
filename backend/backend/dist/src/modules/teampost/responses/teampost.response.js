"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamPostResponse = void 0;
const teamPostResponse = (post, extras = { score: 0, myVote: null, commentCount: 0 }) => {
    let authorLabel = '';
    try {
        const author = post.author;
        authorLabel = typeof author === 'object' && author !== null
            ? (author.username || author.email || '')
            : (author?.toString?.() ?? '');
    }
    catch (e) {
        authorLabel = '';
    }
    let competitionId = null;
    let competitionTitle = null;
    try {
        const competition = post.competition;
        if (typeof competition === 'object' && competition !== null) {
            competitionId = competition._id.toString();
            competitionTitle = competition.title;
        }
        else if (competition) {
            competitionId = competition.toString();
        }
    }
    catch (e) {
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
    };
};
exports.teamPostResponse = teamPostResponse;
