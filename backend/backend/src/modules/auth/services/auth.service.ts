import type {
    AuthGoogleRequest,
    AuthLoginRequest,
    AuthRegisterRequest,
    AuthRegisterResponse,
    AuthResetPasswordRequest,
    AuthResponse,
    AuthTokenResponse
} from "../../../types/auth.types";
import type {TokenPayload} from "../../../types/common.types";
import {Validation} from "../../../validations/validation";
import UserModel from "../../user/models/user.model";
import {ResponseError} from "../../../errors/response-error";
import {Nodemailer} from "../../../utils/nodemailer";
import {JWT} from "../../../utils/jwt";
import {GoogleAuth} from "../../../utils/google-auth";
import bcrypt from "bcrypt";
import {Types} from "mongoose";
import {customAlphabet} from "nanoid";
import {authResponse, registerResponse} from "../responses/auth.response";
import {AuthValidation} from "../validations/auth.validation";
import Session from "../models/session.model";
import {AuthError} from "../../../errors/auth-error";
import logger from "../../../applications/logging";

const randomDigits = customAlphabet('0123456789', 4);

/**
 * AuthService — seluruh logika bisnis autentikasi.
 * Tidak menyentuh req/res (murni logika), sehingga mudah diuji unit.
 */
export class AuthService {
    /** Helper: cari user berdasarkan email tervalidasi; 404 jika tidak ada. */
    private static async findByEmail(email: string) {
        const validateEmail: string = Validation.validate(AuthValidation.EMAIL, email);
        const user = await UserModel.findOne({ email: validateEmail });
        if (!user) throw new ResponseError(404, 'Email not found');
        return user;
    }

    /** Helper: verifikasi access token lalu cari user dari payload-nya; 404 jika tidak ada. */
    private static async findByToken(token: string) {
        const validateToken: string = Validation.validate(AuthValidation.TOKEN, token);
        const decoded: TokenPayload = JWT.verify(validateToken);
        const user = await UserModel.findById(new Types.ObjectId(decoded.id));
        if (!user) throw new ResponseError(404, 'User not found');
        return user;
    }

    /**
     * Mendaftarkan user baru.
     * Alur: validasi → cek duplikat → hash password → simpan → kirim email verifikasi.
     * Tidak mengembalikan token; user wajib verifikasi email sebelum login.
     */
    static async register(request: AuthRegisterRequest): Promise<AuthRegisterResponse> {
        const registerRequest: AuthRegisterRequest = Validation.validate(AuthValidation.REGISTER, request);

        // Username dan email harus unik
        const registerUser = await UserModel.findOne({
            $or: [{ username: registerRequest.username }, { email: registerRequest.email }]
        });
        if (registerUser) throw new ResponseError(400, 'Username or email already exists');

        // Password di-hash dengan bcrypt; confirmPassword tidak ikut disimpan
        const hashedPassword = await bcrypt.hash(registerRequest.password, 10);
        const { confirmPassword, ...data } = registerRequest;
        const user = new UserModel({
            ...data,
            password: hashedPassword,
        });

        await user.save();

        // Kirim link verifikasi (non-blocking: kegagalan SMTP tidak menggagalkan register,
        // user masih bisa memakai endpoint resend-verify-email)
        const verifyToken = JWT.sign({ id: user._id.toString() });
        Nodemailer.sendVerifyEmail(verifyToken, user.email)
            .catch(err => logger.warn(`Failed to send verify email: ${err.message}`));

        return registerResponse(user);
    };

    /**
     * Login dengan username & password.
     * Ditolak jika email belum diverifikasi (403).
     * Menghasilkan access token + refresh token, dan menyimpan sesi di database.
     */
    static async login(request: AuthLoginRequest): Promise<AuthResponse> {
        const loginRequest: AuthLoginRequest = Validation.validate(AuthValidation.LOGIN, request);
        const user = await UserModel.findOne({
            username: loginRequest.username
        });
        // Pesan error sengaja sama agar tidak membocorkan username mana yang terdaftar
        if (!user) throw new ResponseError(400, 'Incorrect username or password');

        // Akun yang dibuat/login lewat Google belum tentu punya password
        if (!user.password) throw new ResponseError(400, 'This account uses Google Sign-In, please login with Google');

        const isMatch: boolean = await bcrypt.compare(loginRequest.password, user.password);
        if (!isMatch) throw new ResponseError(400, 'Incorrect username or password');

        // Wajib verifikasi email terlebih dahulu
        if (!user.isVerified) throw new ResponseError(403, 'Email is not verified, please verify your email first');

        const [accessToken, refreshToken] = [
            JWT.sign({ id: user._id.toString() }),
            JWT.signRefresh({ id: user._id.toString()})
        ];

        // Refresh token disimpan sebagai sesi (berlaku 15 hari) agar bisa dicabut dari server
        await new Session({
            user: user._id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
        }).save();

        return authResponse(user, accessToken, refreshToken);
    };

    /**
     * Login/daftar otomatis lewat Google (Google Identity Services mengirim ID token dari frontend).
     * - googleId sudah pernah dipakai login       -> langsung login akun itu
     * - email sudah terdaftar (register manual)   -> akun ditautkan ke googleId ini (email dianggap terverifikasi)
     * - belum terdaftar sama sekali               -> akun baru dibuat, isVerified true (Google sudah verifikasi email)
     * Akun hasil Google tidak punya password/gender; keduanya bisa dilengkapi lewat endpoint update profil.
     */
    static async googleLogin(request: AuthGoogleRequest): Promise<AuthResponse> {
        const validated: AuthGoogleRequest = Validation.validate(AuthValidation.GOOGLE_LOGIN, request);
        const profile = await GoogleAuth.verifyIdToken(validated.idToken);

        let user = await UserModel.findOne({ googleId: profile.googleId });

        if (!user) {
            user = await UserModel.findOne({ email: profile.email });
            if (user) {
                user.googleId = profile.googleId;
                user.isVerified = true;
                await user.save();
            }
        }

        if (!user) {
            const username = await this.generateUniqueUsername(profile.email);
            user = new UserModel({
                firstName: profile.firstName,
                lastName: profile.lastName,
                email: profile.email,
                username,
                password: null,
                gender: null,
                isVerified: true,
                googleId: profile.googleId
            });
            await user.save();
        }

        const [accessToken, refreshToken] = [
            JWT.sign({ id: user._id.toString() }),
            JWT.signRefresh({ id: user._id.toString() })
        ];

        await new Session({
            user: user._id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
        }).save();

        return authResponse(user, accessToken, refreshToken);
    }

    /** Turunkan username dari bagian lokal email; tambah suffix acak sampai unik. */
    private static async generateUniqueUsername(email: string): Promise<string> {
        const cleaned = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        const base = cleaned.length >= 5 ? cleaned.slice(0, 90) : `${cleaned}user`.slice(0, 90);

        let username = base;
        while (await UserModel.findOne({ username })) {
            username = `${base}${randomDigits()}`;
        }
        return username;
    }

    /** Mengirim ulang email verifikasi (jika email pertama tidak sampai). */
    static async resendVerifyEmail(email: string): Promise<void> {
        const user = await this.findByEmail(email);
        if (user.isVerified) throw new ResponseError(400, 'User is already verified');

        const verifyToken = JWT.sign({ id: user._id.toString() });
        await Nodemailer.sendVerifyEmail(verifyToken, user.email);
    };

    /**
     * Memverifikasi email dari link yang diklik user.
     * Token pada query string berisi id user; jika valid, set isVerified = true.
     */
    static async verifyEmail(token: string): Promise<void> {
        const user = await this.findByToken(token);

        if (user.isVerified) {
            throw new ResponseError(400, 'User is already verified')
        }

        user.isVerified = true
        await user.save();
    };

    /** Langkah 1 reset password: kirim kode 6 digit ke email dan simpan di user. */
    static async forgotPassword(email: string): Promise<number> {
        const user = await this.findByEmail(email);

        user.verificationCode = await Nodemailer.sendVerificationCode(user.email);
        await user.save();
        return user.verificationCode;
    }

    /**
     * Langkah 2 reset password: cocokkan kode dari email.
     * Kode bersifat sekali pakai (dihapus setelah cocok); mengembalikan token reset.
     */
    static async verificationCode(code: number, email: string): Promise<AuthTokenResponse> {
        const validateCode = Validation.validate(AuthValidation.VERIFICATION_CODE, code);
        const user = await this.findByEmail(email);

        if (!user.verificationCode) throw new ResponseError(400, 'Verification code has not been sent');

        if (user.verificationCode !== validateCode) throw new ResponseError(400, 'Invalid verification code');

        const token = JWT.sign({id: user._id.toString()});
        user.verificationCode = null;
        await user.save();

        return {
            token
        }
    };

    /**
     * Langkah 3 reset password: ganti password memakai token dari verify-code.
     * Password baru tidak boleh sama dengan password lama.
     * Akun Google yang belum pernah punya password (password null) tidak punya apa pun untuk
     * dibandingkan — jalur ini sekaligus jadi cara akun tersebut membuat password pertamanya.
     */
    static async resetPassword(request: AuthResetPasswordRequest, token: string): Promise<void> {
        const requestPassword: AuthResetPasswordRequest = Validation.validate(AuthValidation.RESET_PASSWORD, request);
        const user = await this.findByToken(token);

        if (user.password) {
            const isSame = await bcrypt.compare(requestPassword.password, user.password);
            if (isSame) throw new ResponseError(400, 'The new password cannot be the same as the old password');
        }

        user.password = await bcrypt.hash(requestPassword.password, 10);
        await user.save();
    };

    /**
     * Menerbitkan access token baru dari refresh token.
     * Sesi dicek di database; sesi kedaluwarsa dihapus dan ditolak.
     */
    static async session(token: string): Promise<AuthTokenResponse> {
        const validateToken: string = Validation.validate(AuthValidation.TOKEN, token);
        const verifyToken: TokenPayload = JWT.verifyRefresh(validateToken);
        const session = await Session.findOne({ token: validateToken });
        if (!session) throw new AuthError('Session not found');
        if (session.expiresAt.getTime() < Date.now()) {
            await Session.deleteOne({ token: validateToken });
            throw new AuthError('Token expired');
        }
        const user = await UserModel.findById(verifyToken.id);
        if (!user) throw new AuthError('User not found');

        const newAccessToken = JWT.sign({id: user._id.toString()});
        return {
            token: newAccessToken
        }
    }

    /** Revoke refresh token (logout) */
    static async logout(token: string): Promise<void> {
        if (!token) return;
        const validateToken: string = Validation.validate(AuthValidation.TOKEN, token);
        // delete session if exists; ignore result for idempotency
        await Session.deleteOne({ token: validateToken });
    }
}
