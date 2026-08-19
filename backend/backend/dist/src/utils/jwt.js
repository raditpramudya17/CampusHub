"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT = void 0;
/**
 * Utility JWT: pembuatan dan verifikasi access token & refresh token.
 * - Access token  : berlaku 15 menit, dipakai di header X-API-TOKEN
 * - Refresh token : berlaku 1 hari, disimpan di collection Session
 */
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv/config");
const node_crypto_1 = require("node:crypto");
const response_error_1 = require("../errors/response-error");
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
class JWT {
    /** Membuat access token (berlaku 15 menit). */
    static sign(payload) {
        return jsonwebtoken_1.default.sign(payload, JWT_ACCESS_SECRET, { expiresIn: '15m' });
    }
    /** Membuat refresh token (berlaku 1 hari). */
    static signRefresh(payload) {
        // jti unik agar refresh token tidak pernah duplikat (unique index di Session)
        return jsonwebtoken_1.default.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "1d", jwtid: (0, node_crypto_1.randomUUID)() });
    }
    /** Memverifikasi access token; melempar error jika invalid/kedaluwarsa. */
    static verify(token) {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_ACCESS_SECRET);
        if (typeof decoded !== "object" || !('id' in decoded)) {
            throw new response_error_1.ResponseError(400, 'Invalid Token');
        }
        return decoded;
    }
    /** Memverifikasi refresh token; melempar error jika invalid/kedaluwarsa. */
    static verifyRefresh(token) {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_REFRESH_SECRET);
        if (typeof decoded !== "object" || !('id' in decoded)) {
            throw new response_error_1.ResponseError(400, 'Invalid Token');
        }
        return decoded;
    }
}
exports.JWT = JWT;
