import type {TeamPostCommentResponse, TeamPostCommentTypes} from "../../../types/teampostComment.types";

export const teamPostCommentResponse = (comment: TeamPostCommentTypes): TeamPostCommentResponse => {
    let authorLabel = '';
    let authorId = '';
    try {
        const author = (comment as any).author;
        if (typeof author === 'object' && author !== null) {
            authorLabel = (author.username as string) || (author.email as string) || '';
            authorId = author._id ? author._id.toString() : '';
        } else {
            authorLabel = author?.toString?.() ?? '';
            authorId = author?.toString?.() ?? '';
        }
    } catch (e) {
        // biarkan kosong
    }

    return {
        id: comment._id.toString(),
        teamPostId: comment.teamPost.toString(),
        text: comment.text,
        author: authorLabel,
        authorId,
        createdAt: comment.createdAt
    }
}
