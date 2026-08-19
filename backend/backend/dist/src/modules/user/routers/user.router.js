"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Router modul user — mapping URL ke method UserController.
 * Semua path relatif terhadap /api/users (di-mount di applications/web.ts).
 * Seluruh endpoint di modul ini dilindungi auth-middleware (wajib login).
 */
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../../../middlewares/auth-middleware");
const userRouter = (0, express_1.Router)();
userRouter.get('/me', auth_middleware_1.authMiddleware, user_controller_1.UserController.get);
userRouter.patch('/me', auth_middleware_1.authMiddleware, user_controller_1.UserController.update);
userRouter.patch('/me/password', auth_middleware_1.authMiddleware, user_controller_1.UserController.updatePassword);
// Publik: top kontributor. Harus terdaftar SEBELUM '/:username' — Express mencocokkan
// berdasarkan urutan registrasi, ':username' akan menelan '/leaderboard' kalau didaftar duluan.
userRouter.get('/leaderboard', user_controller_1.UserController.leaderboard);
// Admin-only: daftar semua user + ubah role user lain
userRouter.get('/', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, user_controller_1.UserController.getAll);
userRouter.patch('/:id/role', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, user_controller_1.UserController.updateRole);
userRouter.get('/:username', user_controller_1.UserController.getUsername);
exports.default = userRouter;
