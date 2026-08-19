/**
 * Rate limiter untuk endpoint publik yang rawan disalahgunakan:
 * - Chat AI (kuota Ollama kampus terbatas)
 * - Feed publik lomba (mencegah scraping/DoS ringan)
 */
import rateLimit from "express-rate-limit";
import {fail} from "../utils/api-response";

/** POST /api/chat — dibatasi ketat karena tiap request memanggil LLM kampus. */
export const chatRateLimit = rateLimit({
    windowMs: 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => fail(res, 429, 'Too many requests', 'Terlalu banyak permintaan chat, coba lagi sebentar lagi.')
});

/** GET /api/competitions (dan endpoint publik read-only lain) — lebih longgar. */
export const publicReadRateLimit = rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => fail(res, 429, 'Too many requests', 'Terlalu banyak permintaan, coba lagi sebentar lagi.')
});
