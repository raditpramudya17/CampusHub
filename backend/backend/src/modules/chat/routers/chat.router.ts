import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { chatRateLimit } from '../../../middlewares/rate-limit-middleware';

const router = Router();

// POST /api/chat — forward to Ollama public endpoint (no API key required)
// Public endpoint by default (no auth middleware), rate-limited: tiap request memanggil LLM kampus
router.post('/', chatRateLimit, ChatController.chat);
// GET /api/chat/models — daftar model yang tersedia di server Ollama kampus
router.get('/models', ChatController.models);

export default router;
