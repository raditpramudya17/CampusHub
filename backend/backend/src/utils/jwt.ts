/**
 * Utility JWT: pembuatan dan verifikasi access token & refresh token.
 * - Access token  : berlaku 15 menit, dipakai di header X-API-TOKEN
 * - Refresh token : berlaku 1 hari, disimpan di collection Session
 */
import jwt from 'jsonwebtoken';
import 'dotenv/config'
import {randomUUID} from "node:crypto";
import {ResponseError} from "../errors/response-error";
import type {TokenPayload} from "../types/common.types";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

export class JWT {
    /** Membuat access token (berlaku 15 menit). */
    static sign(payload: TokenPayload): string {
        return jwt.sign(payload, JWT_ACCESS_SECRET, {expiresIn: '15m'});
    }

    /** Membuat refresh token (berlaku 1 hari). */
    static signRefresh(payload: TokenPayload): string {
        // jti unik agar refresh token tidak pernah duplikat (unique index di Session)
        return jwt.sign(payload, JWT_REFRESH_SECRET, {expiresIn: "1d", jwtid: randomUUID()})
    }

    /** Memverifikasi access token; melempar error jika invalid/kedaluwarsa. */
    static verify(token: string): TokenPayload {
        const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as TokenPayload;
        if (typeof decoded !== "object" || !('id' in decoded)) {
            throw new ResponseError(400, 'Invalid Token');
        }
        return decoded;
    }

    /** Memverifikasi refresh token; melempar error jika invalid/kedaluwarsa. */
    static verifyRefresh(token: string): TokenPayload {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
        if (typeof decoded !== "object" || !('id' in decoded)) {
            throw new ResponseError(400, 'Invalid Token');
        }
        return decoded;
    }
}
