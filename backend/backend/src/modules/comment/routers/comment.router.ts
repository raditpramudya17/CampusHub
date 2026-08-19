import {Router} from "express";
import {CommentController} from "../controllers/comment.controller";
import {authMiddleware} from "../../../middlewares/auth-middleware";

const commentRouter: Router = Router();

commentRouter.get('/', CommentController.getByCompetition);
commentRouter.post('/', authMiddleware, CommentController.create);
commentRouter.delete('/:id', authMiddleware, CommentController.remove);

export default commentRouter;
