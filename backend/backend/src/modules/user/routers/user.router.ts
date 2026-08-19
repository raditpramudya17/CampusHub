/**
 * Router modul user — mapping URL ke method UserController.
 * Semua path relatif terhadap /api/users (di-mount di applications/web.ts).
 * Seluruh endpoint di modul ini dilindungi auth-middleware (wajib login).
 */
import {Router} from "express";
import {UserController} from "../controllers/user.controller";
import {adminMiddleware, authMiddleware} from "../../../middlewares/auth-middleware";

const userRouter: Router = Router();

userRouter.get('/me', authMiddleware, UserController.get);
userRouter.patch('/me', authMiddleware, UserController.update);
userRouter.patch('/me/password', authMiddleware, UserController.updatePassword);
// Publik: top kontributor. Harus terdaftar SEBELUM '/:username' — Express mencocokkan
// berdasarkan urutan registrasi, ':username' akan menelan '/leaderboard' kalau didaftar duluan.
userRouter.get('/leaderboard', UserController.leaderboard);
// Admin-only: daftar semua user + ubah role user lain
userRouter.get('/', authMiddleware, adminMiddleware, UserController.getAll);
userRouter.patch('/:id/role', authMiddleware, adminMiddleware, UserController.updateRole);
userRouter.get('/:username',UserController.getUsername)

export default userRouter;
