"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Router modul bookmark — mapping URL ke method BookmarkController.
 * Semua path relatif terhadap /api/bookmarks (di-mount di applications/web.ts).
 * Seluruh endpoint di modul ini dilindungi auth-middleware (wajib login).
 */
const express_1 = require("express");
const bookmark_controller_1 = require("../controllers/bookmark.controller");
const auth_middleware_1 = require("../../../middlewares/auth-middleware");
const bookmarkRouter = (0, express_1.Router)();
bookmarkRouter.get('/', auth_middleware_1.authMiddleware, bookmark_controller_1.BookmarkController.getMine);
bookmarkRouter.post('/:competitionId', auth_middleware_1.authMiddleware, bookmark_controller_1.BookmarkController.save);
bookmarkRouter.delete('/:competitionId', auth_middleware_1.authMiddleware, bookmark_controller_1.BookmarkController.remove);
exports.default = bookmarkRouter;
