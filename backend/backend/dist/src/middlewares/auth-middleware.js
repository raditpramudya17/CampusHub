"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = exports.optionalAuthMiddleware = exports.authMiddleware = void 0;
const user_model_1 = __importDefault(require("../modules/user/models/user.model"));
const jwt_1 = require("../utils/jwt");
const auth_error_1 = require("../errors/auth-error");
const response_error_1 = require("../errors/response-error");
const authMiddleware = async (req, res, next) => {
    try {
        // Access token wajib dikirim lewat header X-API-TOKEN
        const token = req.get('X-API-TOKEN');
        if (!token) {
            throw new auth_error_1.AuthError('API token is required');
        }
        // Verifikasi token, lalu pastikan user-nya masih ada di database
        const decoded = jwt_1.JWT.verify(token);
        const user = await user_model_1.default.findById(decoded.id);
        if (!user) {
            throw new auth_error_1.AuthError('User not found');
        }
        req.user = user;
        next();
    }
    catch (e) {
        next(e);
    }
};
exports.authMiddleware = authMiddleware;
/**
 * Seperti authMiddleware, tapi untuk route publik yang PERILAKUNYA berubah
 * jika ada user login (mis. GET /competitions perlu tahu siapa yang bertanya
 * untuk membatasi visibilitas lomba pending/rejected milik orang lain).
 * Token hilang/invalid/kedaluwarsa TIDAK melempar error — request tetap
 * diteruskan, hanya saja req.user tidak terisi (diperlakukan sebagai tamu).
 */
const optionalAuthMiddleware = async (req, res, next) => {
    try {
        const token = req.get('X-API-TOKEN');
        if (token) {
            const decoded = jwt_1.JWT.verify(token);
            const user = await user_model_1.default.findById(decoded.id);
            if (user)
                req.user = user;
        }
    }
    catch (e) {
        // token tidak valid/kedaluwarsa pada route opsional — lanjutkan sebagai tamu
    }
    next();
};
exports.optionalAuthMiddleware = optionalAuthMiddleware;
/**
 * Wajib dipasang SETELAH authMiddleware (butuh req.user sudah terisi).
 * Menolak request dengan 403 jika user yang login bukan admin.
 */
const adminMiddleware = (req, res, next) => {
    const role = req.user?.role;
    if (role !== 'admin') {
        return next(new response_error_1.ResponseError(403, 'Forbidden: admin only'));
    }
    next();
};
exports.adminMiddleware = adminMiddleware;
