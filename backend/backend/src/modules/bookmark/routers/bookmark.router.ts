/**
 * Router modul bookmark — mapping URL ke method BookmarkController.
 * Semua path relatif terhadap /api/bookmarks (di-mount di applications/web.ts).
 * Seluruh endpoint di modul ini dilindungi auth-middleware (wajib login).
 */
import {Router} from "express";
import {BookmarkController} from "../controllers/bookmark.controller";
import {authMiddleware} from "../../../middlewares/auth-middleware";

const bookmarkRouter: Router = Router();

bookmarkRouter.get('/', authMiddleware, BookmarkController.getMine);
bookmarkRouter.post('/:competitionId', authMiddleware, BookmarkController.save);
bookmarkRouter.delete('/:competitionId', authMiddleware, BookmarkController.remove);

export default bookmarkRouter;
