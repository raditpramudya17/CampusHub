/**
 * Model Session — menyimpan refresh token per login.
 * Dengan sesi di database, refresh token bisa dicabut dari sisi server.
 */
import mongoose from "../../../../mongoose/config";
import type {SessionTypes} from "../../../types/auth.types";
import {Schema} from "mongoose";

const sessionModel = new mongoose.Schema<SessionTypes>({
    // Pemilik sesi
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Refresh token; unique karena tiap token diberi jti acak (lihat utils/jwt.ts)
    token: {
        type: String,
        required: true,
        unique: true
    },
    // Batas berlaku sesi (15 hari sejak login)
    expiresAt: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
})

const Session = mongoose.model<SessionTypes>("Session", sessionModel);

export default Session;
