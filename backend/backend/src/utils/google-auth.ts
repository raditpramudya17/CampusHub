/**
 * Utility verifikasi Google ID token (Google Identity Services di frontend).
 * Memastikan token benar-benar diterbitkan Google untuk client ID aplikasi ini
 * sebelum data profil (email, nama) dipercaya.
 */
import {OAuth2Client} from "google-auth-library";
import "dotenv/config";
import {ResponseError} from "../errors/response-error";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export interface GoogleProfile {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
}

export class GoogleAuth {
    /** Memverifikasi ID token ke server Google; melempar error jika invalid/kedaluwarsa/audience salah. */
    static async verifyIdToken(idToken: string): Promise<GoogleProfile> {
        let payload;
        try {
            const ticket = await client.verifyIdToken({idToken, audience: GOOGLE_CLIENT_ID});
            payload = ticket.getPayload();
        } catch {
            throw new ResponseError(400, 'Invalid Google token');
        }

        if (!payload || !payload.email) {
            throw new ResponseError(400, 'Invalid Google token');
        }
        // Google sudah memverifikasi kepemilikan email pemegang token ini
        if (!payload.email_verified) {
            throw new ResponseError(400, 'Google account email is not verified');
        }

        return {
            googleId: payload.sub,
            email: payload.email,
            firstName: payload.given_name || payload.name || 'Google',
            lastName: payload.family_name || 'User'
        };
    }
}
