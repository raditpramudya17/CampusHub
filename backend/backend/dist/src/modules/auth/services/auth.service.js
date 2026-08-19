"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const validation_1 = require("../../../validations/validation");
const user_model_1 = __importDefault(require("../../user/models/user.model"));
const response_error_1 = require("../../../errors/response-error");
const nodemailer_1 = require("../../../utils/nodemailer");
const jwt_1 = require("../../../utils/jwt");
const google_auth_1 = require("../../../utils/google-auth");
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongoose_1 = require("mongoose");
const nanoid_1 = require("nanoid");
const auth_response_1 = require("../responses/auth.response");
const auth_validation_1 = require("../validations/auth.validation");
const session_model_1 = __importDefault(require("../models/session.model"));
const auth_error_1 = require("../../../errors/auth-error");
const logging_1 = __importDefault(require("../../../applications/logging"));
const randomDigits = (0, nanoid_1.customAlphabet)('0123456789', 4);
/**
 * AuthService — seluruh logika bisnis autentikasi.
 * Tidak menyentuh req/res (murni logika), sehingga mudah diuji unit.
 */
class AuthService {
    /** Helper: cari user berdasarkan email tervalidasi; 404 jika tidak ada. */
    static async findByEmail(email) {
        const validateEmail = validation_1.Validation.validate(auth_validation_1.AuthValidation.EMAIL, email);
        const user = await user_model_1.default.findOne({ email: validateEmail });
        if (!user)
            throw new response_error_1.ResponseError(404, 'Email not found');
        return user;
    }
    /** Helper: verifikasi access token lalu cari user dari payload-nya; 404 jika tidak ada. */
    static async findByToken(token) {
        const validateToken = validation_1.Validation.validate(auth_validation_1.AuthValidation.TOKEN, token);
        const decoded = jwt_1.JWT.verify(validateToken);
        const user = await user_model_1.default.findById(new mongoose_1.Types.ObjectId(decoded.id));
        if (!user)
            throw new response_error_1.ResponseError(404, 'User not found');
        return user;
    }
    /**
     * Mendaftarkan user baru.
     * Alur: validasi → cek duplikat → hash password → simpan → kirim email verifikasi.
     * Tidak mengembalikan token; user wajib verifikasi email sebelum login.
     */
    static async register(request) {
        const registerRequest = validation_1.Validation.validate(auth_validation_1.AuthValidation.REGISTER, request);
        // Username dan email harus unik
        const registerUser = await user_model_1.default.findOne({
            $or: [{ username: registerRequest.username }, { email: registerRequest.email }]
        });
        if (registerUser)
            throw new response_error_1.ResponseError(400, 'Username or email already exists');
        // Password di-hash dengan bcrypt; confirmPassword tidak ikut disimpan
        const hashedPassword = await bcrypt_1.default.hash(registerRequest.password, 10);
        const { confirmPassword, ...data } = registerRequest;
        const user = new user_model_1.default({
            ...data,
            password: hashedPassword,
        });
        await user.save();
        // Kirim link verifikasi (non-blocking: kegagalan SMTP tidak menggagalkan register,
        // user masih bisa memakai endpoint resend-verify-email)
        const verifyToken = jwt_1.JWT.sign({ id: user._id.toString() });
        nodemailer_1.Nodemailer.sendVerifyEmail(verifyToken, user.email)
            .catch(err => logging_1.default.warn(`Failed to send verify email: ${err.message}`));
        return (0, auth_response_1.registerResponse)(user);
    }
    ;
    /**
     * Login dengan username & password.
     * Ditolak jika email belum diverifikasi (403).
     * Menghasilkan access token + refresh token, dan menyimpan sesi di database.
     */
    static async login(request) {
        const loginRequest = validation_1.Validation.validate(auth_validation_1.AuthValidation.LOGIN, request);
        const user = await user_model_1.default.findOne({
            username: loginRequest.username
        });
        // Pesan error sengaja sama agar tidak membocorkan username mana yang terdaftar
        if (!user)
            throw new response_error_1.ResponseError(400, 'Incorrect username or password');
        // Akun yang dibuat/login lewat Google belum tentu punya password
        if (!user.password)
            throw new response_error_1.ResponseError(400, 'This account uses Google Sign-In, please login with Google');
        const isMatch = await bcrypt_1.default.compare(loginRequest.password, user.password);
        if (!isMatch)
            throw new response_error_1.ResponseError(400, 'Incorrect username or password');
        // Wajib verifikasi email terlebih dahulu
        if (!user.isVerified)
            throw new response_error_1.ResponseError(403, 'Email is not verified, please verify your email first');
        const [accessToken, refreshToken] = [
            jwt_1.JWT.sign({ id: user._id.toString() }),
            jwt_1.JWT.signRefresh({ id: user._id.toString() })
        ];
        // Refresh token disimpan sebagai sesi (berlaku 15 hari) agar bisa dicabut dari server
        await new session_model_1.default({
            user: user._id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
        }).save();
        return (0, auth_response_1.authResponse)(user, accessToken, refreshToken);
    }
    ;
    /**
     * Login/daftar otomatis lewat Google (Google Identity Services mengirim ID token dari frontend).
     * - googleId sudah pernah dipakai login       -> langsung login akun itu
     * - email sudah terdaftar (register manual)   -> akun ditautkan ke googleId ini (email dianggap terverifikasi)
     * - belum terdaftar sama sekali               -> akun baru dibuat, isVerified true (Google sudah verifikasi email)
     * Akun hasil Google tidak punya password/gender; keduanya bisa dilengkapi lewat endpoint update profil.
     */
    static async googleLogin(request) {
        const validated = validation_1.Validation.validate(auth_validation_1.AuthValidation.GOOGLE_LOGIN, request);
        const profile = await google_auth_1.GoogleAuth.verifyIdToken(validated.idToken);
        let user = await user_model_1.default.findOne({ googleId: profile.googleId });
        if (!user) {
            user = await user_model_1.default.findOne({ email: profile.email });
            if (user) {
                user.googleId = profile.googleId;
                user.isVerified = true;
                await user.save();
            }
        }
        if (!user) {
            const username = await this.generateUniqueUsername(profile.email);
            user = new user_model_1.default({
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
            jwt_1.JWT.sign({ id: user._id.toString() }),
            jwt_1.JWT.signRefresh({ id: user._id.toString() })
        ];
        await new session_model_1.default({
            user: user._id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
        }).save();
        return (0, auth_response_1.authResponse)(user, accessToken, refreshToken);
    }
    /** Turunkan username dari bagian lokal email; tambah suffix acak sampai unik. */
    static async generateUniqueUsername(email) {
        const cleaned = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        const base = cleaned.length >= 5 ? cleaned.slice(0, 90) : `${cleaned}user`.slice(0, 90);
        let username = base;
        while (await user_model_1.default.findOne({ username })) {
            username = `${base}${randomDigits()}`;
        }
        return username;
    }
    /** Mengirim ulang email verifikasi (jika email pertama tidak sampai). */
    static async resendVerifyEmail(email) {
        const user = await this.findByEmail(email);
        if (user.isVerified)
            throw new response_error_1.ResponseError(400, 'User is already verified');
        const verifyToken = jwt_1.JWT.sign({ id: user._id.toString() });
        await nodemailer_1.Nodemailer.sendVerifyEmail(verifyToken, user.email);
    }
    ;
    /**
     * Memverifikasi email dari link yang diklik user.
     * Token pada query string berisi id user; jika valid, set isVerified = true.
     */
    static async verifyEmail(token) {
        const user = await this.findByToken(token);
        if (user.isVerified) {
            throw new response_error_1.ResponseError(400, 'User is already verified');
        }
        user.isVerified = true;
        await user.save();
    }
    ;
    /** Langkah 1 reset password: kirim kode 6 digit ke email dan simpan di user. */
    static async forgotPassword(email) {
        const user = await this.findByEmail(email);
        user.verificationCode = await nodemailer_1.Nodemailer.sendVerificationCode(user.email);
        await user.save();
        return user.verificationCode;
    }
    /**
     * Langkah 2 reset password: cocokkan kode dari email.
     * Kode bersifat sekali pakai (dihapus setelah cocok); mengembalikan token reset.
     */
    static async verificationCode(code, email) {
        const validateCode = validation_1.Validation.validate(auth_validation_1.AuthValidation.VERIFICATION_CODE, code);
        const user = await this.findByEmail(email);
        if (!user.verificationCode)
            throw new response_error_1.ResponseError(400, 'Verification code has not been sent');
        if (user.verificationCode !== validateCode)
            throw new response_error_1.ResponseError(400, 'Invalid verification code');
        const token = jwt_1.JWT.sign({ id: user._id.toString() });
        user.verificationCode = null;
        await user.save();
        return {
            token
        };
    }
    ;
    /**
     * Langkah 3 reset password: ganti password memakai token dari verify-code.
     * Password baru tidak boleh sama dengan password lama.
     * Akun Google yang belum pernah punya password (password null) tidak punya apa pun untuk
     * dibandingkan — jalur ini sekaligus jadi cara akun tersebut membuat password pertamanya.
     */
    static async resetPassword(request, token) {
        const requestPassword = validation_1.Validation.validate(auth_validation_1.AuthValidation.RESET_PASSWORD, request);
        const user = await this.findByToken(token);
        if (user.password) {
            const isSame = await bcrypt_1.default.compare(requestPassword.password, user.password);
            if (isSame)
                throw new response_error_1.ResponseError(400, 'The new password cannot be the same as the old password');
        }
        user.password = await bcrypt_1.default.hash(requestPassword.password, 10);
        await user.save();
    }
    ;
    /**
     * Menerbitkan access token baru dari refresh token.
     * Sesi dicek di database; sesi kedaluwarsa dihapus dan ditolak.
     */
    static async session(token) {
        const validateToken = validation_1.Validation.validate(auth_validation_1.AuthValidation.TOKEN, token);
        const verifyToken = jwt_1.JWT.verifyRefresh(validateToken);
        const session = await session_model_1.default.findOne({ token: validateToken });
        if (!session)
            throw new auth_error_1.AuthError('Session not found');
        if (session.expiresAt.getTime() < Date.now()) {
            await session_model_1.default.deleteOne({ token: validateToken });
            throw new auth_error_1.AuthError('Token expired');
        }
        const user = await user_model_1.default.findById(verifyToken.id);
        if (!user)
            throw new auth_error_1.AuthError('User not found');
        const newAccessToken = jwt_1.JWT.sign({ id: user._id.toString() });
        return {
            token: newAccessToken
        };
    }
    /** Revoke refresh token (logout) */
    static async logout(token) {
        if (!token)
            return;
        const validateToken = validation_1.Validation.validate(auth_validation_1.AuthValidation.TOKEN, token);
        // delete session if exists; ignore result for idempotency
        await session_model_1.default.deleteOne({ token: validateToken });
    }
}
exports.AuthService = AuthService;
