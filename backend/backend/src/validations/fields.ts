/**
 * Definisi aturan validasi tiap field (dipakai bersama oleh semua skema).
 * Diletakkan terpusat agar aturan konsisten di seluruh modul.
 */
import {z} from "zod";

export const fields = {
    email: z.email().min(3, 'minimal 3 karakter').max(100, 'maksimal 100 karakter'),
    token: z.string().min(1, 'Wajib mengisi token'),
    firstName: z.string().min(3, 'minimal 3 karakter').max(100, 'maksimal 100 karakter'),
    lastName: z.string().min(3, 'minimal 3 karakter').max(100, 'maksimal 100 karakter'),
    username: z.string().min(5, 'minimal 5 karakter').max(100, 'maksimal 100 karakter'),
    password: z.string().min(8, 'minimal 8 karakter').max(100, 'maksimal 100 karakter'),
    confirmPassword: z.string().min(8, 'minimal 8 karakter').max(100, 'maksimal 100 karakter'),
    gender: z.enum(['male', 'female'], 'gender male atau female saja'),
    verificationCode: z.number().int().min(100000, "Verifikasi kode minimal 6 digit").max(999999, "Verifikasi kode maksimal 6 digit"),
    idToken: z.string().min(1, 'Wajib mengisi idToken')
}
