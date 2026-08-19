"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_controller_1 = require("../controllers/chat.controller");
const rate_limit_middleware_1 = require("../../../middlewares/rate-limit-middleware");
const router = (0, express_1.Router)();
// POST /api/chat — forward to Ollama public endpoint (no API key required)
// Public endpoint by default (no auth middleware), rate-limited: tiap request memanggil LLM kampus
router.post('/', rate_limit_middleware_1.chatRateLimit, chat_controller_1.ChatController.chat);
// GET /api/chat/models — daftar model yang tersedia di server Ollama kampus
router.get('/models', chat_controller_1.ChatController.models);
exports.default = router;
