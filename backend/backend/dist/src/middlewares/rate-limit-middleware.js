"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicReadRateLimit = exports.chatRateLimit = void 0;
/**
 * Rate limiter untuk endpoint publik yang rawan disalahgunakan:
 * - Chat AI (kuota Ollama kampus terbatas)
 * - Feed publik lomba (mencegah scraping/DoS ringan)
 */
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const api_response_1 = require("../utils/api-response");
/** POST /api/chat — dibatasi ketat karena tiap request memanggil LLM kampus. */
exports.chatRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => (0, api_response_1.fail)(res, 429, 'Too many requests', 'Terlalu banyak permintaan chat, coba lagi sebentar lagi.')
});
/** GET /api/competitions (dan endpoint publik read-only lain) — lebih longgar. */
exports.publicReadRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => (0, api_response_1.fail)(res, 429, 'Too many requests', 'Terlalu banyak permintaan, coba lagi sebentar lagi.')
});
