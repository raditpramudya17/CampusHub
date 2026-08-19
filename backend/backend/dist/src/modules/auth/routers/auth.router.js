"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Router modul auth — mapping URL ke method AuthController.
 * Semua path relatif terhadap /api/auth (di-mount di applications/web.ts).
 */
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const authRouter = (0, express_1.Router)();
authRouter.post('/register', auth_controller_1.AuthController.register);
authRouter.post('/login', auth_controller_1.AuthController.login);
authRouter.post('/google', auth_controller_1.AuthController.google);
authRouter.get('/verify-email', auth_controller_1.AuthController.verifyEmail);
authRouter.post('/resend-verify-email', auth_controller_1.AuthController.resendVerifyEmail);
authRouter.post('/verify-code', auth_controller_1.AuthController.verifyCode);
authRouter.post('/forgot-password', auth_controller_1.AuthController.forgotPassword);
authRouter.post('/reset-password', auth_controller_1.AuthController.resetPassword);
authRouter.post('/refresh-token', auth_controller_1.AuthController.session);
authRouter.post('/logout', auth_controller_1.AuthController.logout);
exports.default = authRouter;
