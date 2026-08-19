"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Nodemailer = void 0;
/**
 * Utility pengiriman email via SMTP (konfigurasi dari .env).
 * Dipakai untuk verifikasi email dan kode reset password.
 */
const nodemailer_1 = __importDefault(require("nodemailer"));
require("dotenv/config");
const nanoid_1 = require("nanoid");
const response_error_1 = require("../errors/response-error");
const USER = process.env.SMTP_USER;
const HOST = process.env.SMTP_HOST;
const PASSWORD = process.env.SMTP_PASSWORD;
const PORT = process.env.SMTP_PORT;
const APP_URL = process.env.APP_URL;
class Nodemailer {
    // Transport SMTP dibuat sekali dan dipakai ulang untuk semua email
    static transport = nodemailer_1.default.createTransport({
        host: HOST,
        port: Number(PORT),
        secure: false,
        auth: {
            user: USER,
            pass: PASSWORD
        }
    });
    /** Mengirim link verifikasi email berisi token JWT. */
    static async sendVerifyEmail(token, email) {
        const verifyUrl = `${APP_URL}/api/auth/verify-email?token=${token}`;
        const info = await this.transport.sendMail({
            from: `"Support" <${USER}>`,
            to: email,
            subject: 'email verification',
            text: `Verify your email here`,
            html: `<a href="${verifyUrl}">Click here</a><p>to verify</p>`
        });
        return info.accepted;
    }
    ;
    /** Mengirim kode verifikasi 6 digit (untuk reset password), lalu mengembalikan kodenya. */
    static async sendVerificationCode(email) {
        const code = (0, nanoid_1.customAlphabet)('123456789', 6)();
        const info = await this.transport.sendMail({
            from: `"Support" <${USER}>`,
            to: email,
            subject: 'verification code',
            text: `Your verification code is: ${code}`,
            html: `<p>Your verification code is: <h1>${code}</h1></p>`
        });
        if (!info.accepted || info.accepted.length === 0)
            throw new response_error_1.ResponseError(400, 'Failed to send verification code');
        return Number(code);
    }
    /** Mengirim email reminder deadline lomba tersimpan (dipanggil dari ReminderService). */
    static async sendDeadlineReminder(email, competitionTitle, daysLeft, deadlineLabel) {
        const dayLabel = daysLeft === 1 ? 'besok' : `${daysLeft} hari lagi`;
        await this.transport.sendMail({
            from: `"CampusHub" <${USER}>`,
            to: email,
            subject: `Pengingat: pendaftaran "${competitionTitle}" ditutup ${dayLabel}`,
            text: `Pendaftaran lomba "${competitionTitle}" yang kamu simpan ditutup ${dayLabel} (${deadlineLabel}). Jangan sampai terlewat!`,
            html: `<p>Pendaftaran lomba <strong>${competitionTitle}</strong> yang kamu simpan ditutup <strong>${dayLabel}</strong> (${deadlineLabel}). Jangan sampai terlewat!</p>`
        });
    }
}
exports.Nodemailer = Nodemailer;
