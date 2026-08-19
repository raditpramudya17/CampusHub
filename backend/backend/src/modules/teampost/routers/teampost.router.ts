import {Router} from "express";
import {TeamPostController} from "../controllers/teampost.controller";
import {TeamPostCommentController} from "../controllers/teampost-comment.controller";
import {authMiddleware, optionalAuthMiddleware} from "../../../middlewares/auth-middleware";

const teamPostRouter: Router = Router();

// optionalAuthMiddleware: perlu tahu siapa yang bertanya agar setiap post bisa menyertakan myVote milik requester
teamPostRouter.get('/', optionalAuthMiddleware, TeamPostController.getAll);
teamPostRouter.post('/', authMiddleware, TeamPostController.create);

// Vote naik/turun — klik ulang tombol yang sama membatalkan vote (lihat TeamPostService.vote)
teamPostRouter.post('/:id/vote', authMiddleware, TeamPostController.vote);

// Diskusi/tanya-jawab per pengumuman cari tim
teamPostRouter.get('/:id/comments', TeamPostCommentController.getByTeamPost);
teamPostRouter.post('/:id/comments', authMiddleware, TeamPostCommentController.create);
teamPostRouter.delete('/comments/:commentId', authMiddleware, TeamPostCommentController.remove);

teamPostRouter.delete('/:id', authMiddleware, TeamPostController.remove);

export default teamPostRouter;
