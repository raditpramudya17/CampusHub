"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const api_response_1 = require("../../../utils/api-response");
/**
 * AuthController — lapisan HTTP modul auth.
 * Pola setiap method: ambil body/query → panggil AuthService → bungkus response sukses.
 * Tidak perlu try/catch: Express 5 otomatis meneruskan error async ke error-middleware.
 */
class AuthController {
    /** POST /api/auth/register — daftar user baru + kirim email verifikasi. */
    static async register(req, res, next) {
        const request = req.body;
        const response = await auth_service_1.AuthService.register(request);
        return (0, api_response_1.success)(res, 201, 'User created successfully, please check your email to verify your account', response);
    }
    ;
    /** POST /api/auth/resend-verify-email — kirim ulang email verifikasi. */
    static async resendVerifyEmail(req, res, next) {
        const { email } = req.body;
        await auth_service_1.AuthService.resendVerifyEmail(email);
        return (0, api_response_1.success)(res, 200, 'Verification email has been sent', null);
    }
    ;
    /** POST /api/auth/login — login, mengembalikan access + refresh token. */
    static async login(req, res, next) {
        const request = req.body;
        const response = await auth_service_1.AuthService.login(request);
        return (0, api_response_1.success)(res, 200, 'User login successfully', response);
    }
    ;
    /** GET /api/auth/verify-email?token= — verifikasi email dari link. */
    static async verifyEmail(req, res, next) {
        const { token } = req.query;
        await auth_service_1.AuthService.verifyEmail(token);
        return (0, api_response_1.success)(res, 200, 'Verify email successfully', null);
    }
    /** POST /api/auth/forgot-password — kirim kode reset 6 digit ke email. */
    static async forgotPassword(req, res, next) {
        const { email } = req.body;
        const response = await auth_service_1.AuthService.forgotPassword(email);
        return (0, api_response_1.success)(res, 200, 'Verification code has been sent to your email', response);
    }
    ;
    /** POST /api/auth/verify-code?email= — cocokkan kode, mengembalikan token reset. */
    static async verifyCode(req, res, next) {
        const { verificationCode } = req.body;
        const { email } = req.query;
        const response = await auth_service_1.AuthService.verificationCode(verificationCode, email);
        return (0, api_response_1.success)(res, 200, 'Verification code successfully', response);
    }
    ;
    /** POST /api/auth/reset-password?token= — ganti password dengan token reset. */
    static async resetPassword(req, res, next) {
        const { token = '' } = req.query;
        const request = req.body;
        await auth_service_1.AuthService.resetPassword(request, token);
        return (0, api_response_1.success)(res, 200, 'Reset password successfully', null);
    }
    ;
    /** POST /api/auth/refresh-token — access token baru dari refresh token. */
    static async session(req, res, next) {
        const { refreshToken } = req.body;
        const response = await auth_service_1.AuthService.session(refreshToken);
        return (0, api_response_1.success)(res, 200, 'Create access token successfully', response);
    }
    /** POST /api/auth/google — login/daftar otomatis lewat Google ID token. */
    static async google(req, res, next) {
        const request = req.body;
        const response = await auth_service_1.AuthService.googleLogin(request);
        return (0, api_response_1.success)(res, 200, 'Google login successful', response);
    }
    ;
    /** POST /api/auth/logout — revoke refresh token and end session */
    static async logout(req, res, next) {
        const { refreshToken } = req.body;
        await auth_service_1.AuthService.logout(refreshToken);
        return (0, api_response_1.success)(res, 200, 'Logout successful', null);
    }
}
exports.AuthController = AuthController;
