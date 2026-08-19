"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Model Session — menyimpan refresh token per login.
 * Dengan sesi di database, refresh token bisa dicabut dari sisi server.
 */
const config_1 = __importDefault(require("../../../../mongoose/config"));
const mongoose_1 = require("mongoose");
const sessionModel = new config_1.default.Schema({
    // Pemilik sesi
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
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
});
const Session = config_1.default.model("Session", sessionModel);
exports.default = Session;
