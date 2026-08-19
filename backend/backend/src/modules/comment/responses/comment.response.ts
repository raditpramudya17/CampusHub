import type {CommentResponse, CommentTypes} from "../../../types/comment.types";

export const commentResponse = (comment: CommentTypes): CommentResponse => {
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
        competitionId: comment.competition.toString(),
        text: comment.text,
        author: authorLabel,
        authorId,
        createdAt: comment.createdAt
    }
}
