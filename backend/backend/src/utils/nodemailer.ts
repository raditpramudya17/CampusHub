/**
 * Utility pengiriman email via SMTP (konfigurasi dari .env).
 * Dipakai untuk verifikasi email dan kode reset password.
 */
import nodemailer from 'nodemailer';
import 'dotenv/config';
import { customAlphabet } from 'nanoid';
import {ResponseError} from "../errors/response-error";

const USER = process.env.SMTP_USER as string;
const HOST = process.env.SMTP_HOST as string;
const PASSWORD = process.env.SMTP_PASSWORD as string;
const PORT = process.env.SMTP_PORT as string;
const APP_URL = process.env.APP_URL as string;

export class Nodemailer {
    // Transport SMTP dibuat sekali dan dipakai ulang untuk semua email
    private static transport = nodemailer.createTransport({
        host: HOST,
        port: Number(PORT),
        secure: false,
        auth: {
            user: USER,
            pass: PASSWORD
        }
    });

    /** Mengirim link verifikasi email berisi token JWT. */
    static async sendVerifyEmail (token: string, email: string) {
        const verifyUrl = `${APP_URL}/api/auth/verify-email?token=${token}`;
        const info = await this.transport.sendMail({
            from: `"Support" <${USER}>`,
            to: email,
            subject: 'email verification',
            text: `Verify your email here`,
            html: `<a href="${verifyUrl}">Click here</a><p>to verify</p>`
        });
        return info.accepted
    };

    /** Mengirim kode verifikasi 6 digit (untuk reset password), lalu mengembalikan kodenya. */
    static async sendVerificationCode (email: string): Promise<number> {
        const code = customAlphabet('123456789', 6)();
        const info = await this.transport.sendMail({
            from: `"Support" <${USER}>`,
            to: email,
            subject: 'verification code',
            text: `Your verification code is: ${code}`,
            html: `<p>Your verification code is: <h1>${code}</h1></p>`
        })
        if (!info.accepted || info.accepted.length === 0)
            throw new ResponseError(400, 'Failed to send verification code');

        return Number(code);
    }

    /** Mengirim email reminder deadline lomba tersimpan (dipanggil dari ReminderService). */
    static async sendDeadlineReminder(email: string, competitionTitle: string, daysLeft: number, deadlineLabel: string) {
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
