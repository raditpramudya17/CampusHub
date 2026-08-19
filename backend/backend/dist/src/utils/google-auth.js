"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleAuth = void 0;
/**
 * Utility verifikasi Google ID token (Google Identity Services di frontend).
 * Memastikan token benar-benar diterbitkan Google untuk client ID aplikasi ini
 * sebelum data profil (email, nama) dipercaya.
 */
const google_auth_library_1 = require("google-auth-library");
require("dotenv/config");
const response_error_1 = require("../errors/response-error");
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new google_auth_library_1.OAuth2Client(GOOGLE_CLIENT_ID);
class GoogleAuth {
    /** Memverifikasi ID token ke server Google; melempar error jika invalid/kedaluwarsa/audience salah. */
    static async verifyIdToken(idToken) {
        let payload;
        try {
            const ticket = await client.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });
            payload = ticket.getPayload();
        }
        catch {
            throw new response_error_1.ResponseError(400, 'Invalid Google token');
        }
        if (!payload || !payload.email) {
            throw new response_error_1.ResponseError(400, 'Invalid Google token');
        }
        // Google sudah memverifikasi kepemilikan email pemegang token ini
        if (!payload.email_verified) {
            throw new response_error_1.ResponseError(400, 'Google account email is not verified');
        }
        return {
            googleId: payload.sub,
            email: payload.email,
            firstName: payload.given_name || payload.name || 'Google',
            lastName: payload.family_name || 'User'
        };
    }
}
exports.GoogleAuth = GoogleAuth;
