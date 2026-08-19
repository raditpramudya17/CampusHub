"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const teampost_controller_1 = require("../controllers/teampost.controller");
const teampost_comment_controller_1 = require("../controllers/teampost-comment.controller");
const auth_middleware_1 = require("../../../middlewares/auth-middleware");
const teamPostRouter = (0, express_1.Router)();
// optionalAuthMiddleware: perlu tahu siapa yang bertanya agar setiap post bisa menyertakan myVote milik requester
teamPostRouter.get('/', auth_middleware_1.optionalAuthMiddleware, teampost_controller_1.TeamPostController.getAll);
teamPostRouter.post('/', auth_middleware_1.authMiddleware, teampost_controller_1.TeamPostController.create);
// Vote naik/turun — klik ulang tombol yang sama membatalkan vote (lihat TeamPostService.vote)
teamPostRouter.post('/:id/vote', auth_middleware_1.authMiddleware, teampost_controller_1.TeamPostController.vote);
// Diskusi/tanya-jawab per pengumuman cari tim
teamPostRouter.get('/:id/comments', teampost_comment_controller_1.TeamPostCommentController.getByTeamPost);
teamPostRouter.post('/:id/comments', auth_middleware_1.authMiddleware, teampost_comment_controller_1.TeamPostCommentController.create);
teamPostRouter.delete('/comments/:commentId', auth_middleware_1.authMiddleware, teampost_comment_controller_1.TeamPostCommentController.remove);
teamPostRouter.delete('/:id', auth_middleware_1.authMiddleware, teampost_controller_1.TeamPostController.remove);
exports.default = teamPostRouter;
