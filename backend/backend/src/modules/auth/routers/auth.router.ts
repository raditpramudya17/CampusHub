/**
 * Router modul auth — mapping URL ke method AuthController.
 * Semua path relatif terhadap /api/auth (di-mount di applications/web.ts).
 */
import {Router} from "express";
import {AuthController} from "../controllers/auth.controller";

const authRouter: Router = Router();

authRouter.post('/register', AuthController.register);
authRouter.post('/login', AuthController.login);
authRouter.post('/google', AuthController.google);
authRouter.get('/verify-email', AuthController.verifyEmail);
authRouter.post('/resend-verify-email', AuthController.resendVerifyEmail);
authRouter.post('/verify-code', AuthController.verifyCode);
authRouter.post('/forgot-password', AuthController.forgotPassword);
authRouter.post('/reset-password', AuthController.resetPassword);
authRouter.post('/refresh-token', AuthController.session);
authRouter.post('/logout', AuthController.logout);

export default authRouter;
