"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fields = void 0;
/**
 * Definisi aturan validasi tiap field (dipakai bersama oleh semua skema).
 * Diletakkan terpusat agar aturan konsisten di seluruh modul.
 */
const zod_1 = require("zod");
exports.fields = {
    email: zod_1.z.email().min(3, 'minimal 3 karakter').max(100, 'maksimal 100 karakter'),
    token: zod_1.z.string().min(1, 'Wajib mengisi token'),
    firstName: zod_1.z.string().min(3, 'minimal 3 karakter').max(100, 'maksimal 100 karakter'),
    lastName: zod_1.z.string().min(3, 'minimal 3 karakter').max(100, 'maksimal 100 karakter'),
    username: zod_1.z.string().min(5, 'minimal 5 karakter').max(100, 'maksimal 100 karakter'),
    password: zod_1.z.string().min(8, 'minimal 8 karakter').max(100, 'maksimal 100 karakter'),
    confirmPassword: zod_1.z.string().min(8, 'minimal 8 karakter').max(100, 'maksimal 100 karakter'),
    gender: zod_1.z.enum(['male', 'female'], 'gender male atau female saja'),
    verificationCode: zod_1.z.number().int().min(100000, "Verifikasi kode minimal 6 digit").max(999999, "Verifikasi kode maksimal 6 digit"),
    idToken: zod_1.z.string().min(1, 'Wajib mengisi idToken')
};
