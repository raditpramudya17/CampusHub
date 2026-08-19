"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentResponse = void 0;
const commentResponse = (comment) => {
    let authorLabel = '';
    let authorId = '';
    try {
        const author = comment.author;
        if (typeof author === 'object' && author !== null) {
            authorLabel = author.username || author.email || '';
            authorId = author._id ? author._id.toString() : '';
        }
        else {
            authorLabel = author?.toString?.() ?? '';
            authorId = author?.toString?.() ?? '';
        }
    }
    catch (e) {
        // biarkan kosong
    }
    return {
        id: comment._id.toString(),
        competitionId: comment.competition.toString(),
        text: comment.text,
        author: authorLabel,
        authorId,
        createdAt: comment.createdAt
    };
};
exports.commentResponse = commentResponse;
