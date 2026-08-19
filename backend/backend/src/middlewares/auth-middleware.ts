/**
 * Middleware proteksi endpoint.
 * Memverifikasi access token dari header X-API-TOKEN,
 * lalu menempelkan data user ke req.user agar bisa dipakai controller berikutnya.
 */
import type {NextFunction, Response} from "express";
import UserModel from "../modules/user/models/user.model";
import type {UserRequest} from "../types/user.types";
import {JWT} from "../utils/jwt";
import {AuthError} from "../errors/auth-error";
import {ResponseError} from "../errors/response-error";

export const authMiddleware = async (req: UserRequest, res: Response, next: NextFunction) => {
    try {
        // Access token wajib dikirim lewat header X-API-TOKEN
        const token = req.get('X-API-TOKEN');
        if(!token) {
            throw new AuthError('API token is required');
        }

        // Verifikasi token, lalu pastikan user-nya masih ada di database
        const decoded = JWT.verify(token);
        const user = await UserModel.findById(decoded.id);
        if (!user) {
            throw new AuthError('User not found');
        }

        req.user = user;
        next();
    } catch (e) {
        next(e);
    }
}

/**
 * Seperti authMiddleware, tapi untuk route publik yang PERILAKUNYA berubah
 * jika ada user login (mis. GET /competitions perlu tahu siapa yang bertanya
 * untuk membatasi visibilitas lomba pending/rejected milik orang lain).
 * Token hilang/invalid/kedaluwarsa TIDAK melempar error — request tetap
 * diteruskan, hanya saja req.user tidak terisi (diperlakukan sebagai tamu).
 */
export const optionalAuthMiddleware = async (req: UserRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.get('X-API-TOKEN');
        if (token) {
            const decoded = JWT.verify(token);
            const user = await UserModel.findById(decoded.id);
            if (user) req.user = user;
        }
    } catch (e) {
        // token tidak valid/kedaluwarsa pada route opsional — lanjutkan sebagai tamu
    }
    next();
}

/**
 * Wajib dipasang SETELAH authMiddleware (butuh req.user sudah terisi).
 * Menolak request dengan 403 jika user yang login bukan admin.
 */
export const adminMiddleware = (req: UserRequest, res: Response, next: NextFunction) => {
    const role = (req.user as any)?.role;
    if (role !== 'admin') {
        return next(new ResponseError(403, 'Forbidden: admin only'));
    }
    next();
}
