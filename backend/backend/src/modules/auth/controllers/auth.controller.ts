import type {
    AuthGoogleRequest,
    AuthLoginRequest,
    AuthRegisterRequest,
    AuthRegisterResponse,
    AuthResetPasswordRequest,
    AuthResponse,
    AuthTokenResponse
} from "../../../types/auth.types";
import type {NextFunction, Request, Response} from "express";
import {AuthService} from "../services/auth.service";
import {success} from "../../../utils/api-response";

/**
 * AuthController — lapisan HTTP modul auth.
 * Pola setiap method: ambil body/query → panggil AuthService → bungkus response sukses.
 * Tidak perlu try/catch: Express 5 otomatis meneruskan error async ke error-middleware.
 */
export class AuthController {
    /** POST /api/auth/register — daftar user baru + kirim email verifikasi. */
    static async register(req: Request, res: Response, next: NextFunction): Promise<Response> {
        const request = req.body as AuthRegisterRequest;
        const response: AuthRegisterResponse = await AuthService.register(request);
        return success(res, 201, 'User created successfully, please check your email to verify your account', response);
    };

    /** POST /api/auth/resend-verify-email — kirim ulang email verifikasi. */
    static async resendVerifyEmail(req: Request, res: Response, next: NextFunction): Promise<Response> {
        const { email } = req.body as { email: string };
        await AuthService.resendVerifyEmail(email);
        return success(res, 200, 'Verification email has been sent', null);
    };

    /** POST /api/auth/login — login, mengembalikan access + refresh token. */
    static async login(req: Request, res: Response, next: NextFunction): Promise<Response> {
        const request = req.body as AuthLoginRequest;
        const response: AuthResponse = await AuthService.login(request);
        return success(res, 200, 'User login successfully', response);
    };

    /** GET /api/auth/verify-email?token= — verifikasi email dari link. */
    static async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<Response> {
        const { token } = req.query as { token: string };
        await AuthService.verifyEmail(token);
        return success(res, 200, 'Verify email successfully', null);
    }

    /** POST /api/auth/forgot-password — kirim kode reset 6 digit ke email. */
    static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<Response> {
        const { email } = req.body as { email: string };
        const response: number = await AuthService.forgotPassword(email);
        return success(res, 200, 'Verification code has been sent to your email', response);
    };

    /** POST /api/auth/verify-code?email= — cocokkan kode, mengembalikan token reset. */
    static async verifyCode(req: Request, res: Response, next: NextFunction): Promise<Response> {
        const { verificationCode } = req.body as { verificationCode: number };
        const { email } = req.query as { email: string };
        const response: AuthTokenResponse = await AuthService.verificationCode(verificationCode, email);
        return success(res, 200, 'Verification code successfully', response);
    };

    /** POST /api/auth/reset-password?token= — ganti password dengan token reset. */
    static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<Response> {
        const { token = '' } = req.query as { token: string };
        const request = req.body as AuthResetPasswordRequest;
        await AuthService.resetPassword(request, token);
        return success(res, 200, 'Reset password successfully', null);
    };

    /** POST /api/auth/refresh-token — access token baru dari refresh token. */
    static async session(req: Request, res: Response, next: NextFunction): Promise<Response> {
        const { refreshToken } = req.body as { refreshToken: string };
        const response: AuthTokenResponse = await AuthService.session(refreshToken);
        return success(res, 200, 'Create access token successfully', response);
    }

    /** POST /api/auth/google — login/daftar otomatis lewat Google ID token. */
    static async google(req: Request, res: Response, next: NextFunction): Promise<Response> {
        const request = req.body as AuthGoogleRequest;
        const response: AuthResponse = await AuthService.googleLogin(request);
        return success(res, 200, 'Google login successful', response);
    };

    /** POST /api/auth/logout — revoke refresh token and end session */
    static async logout(req: Request, res: Response, next: NextFunction): Promise<Response> {
        const { refreshToken } = req.body as { refreshToken: string };
        await AuthService.logout(refreshToken);
        return success(res, 200, 'Logout successful', null);
    }
}
