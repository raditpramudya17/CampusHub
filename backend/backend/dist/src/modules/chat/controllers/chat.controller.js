"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const axios_1 = __importDefault(require("axios"));
const user_model_1 = __importDefault(require("../../user/models/user.model"));
const jwt_1 = require("../../../utils/jwt");
const chat_context_service_1 = require("../services/chat-context.service");
const OLLAMA_BASE_URL = 'https://ollama.if.unismuh.ac.id';
const OLLAMA_GENERATE_URL = `${OLLAMA_BASE_URL}/api/generate`;
const OLLAMA_TAGS_URL = `${OLLAMA_BASE_URL}/api/tags`;
// Ollama matches model names EXACTLY including the tag (e.g. "gemma3:27b"),
// it does not resolve a bare "gemma3" to a default tag. The chatbot was
// "broken" because callers were sending bare names — requests either failed
// fast with "model not found" or hung until timeout trying to resolve one.
// DEFAULT_MODEL / MODEL_ALIASES keep the API working even if an older/typo'd
// client still sends a bare name.
const DEFAULT_MODEL = 'gemma4:latest';
const MODEL_ALIASES = {
    gemma3: 'gemma3:27b',
    gemma4: 'gemma4:latest',
};
class ChatController {
    /**
     * POST /api/chat
     * Body: { model?: string, prompt: string, stream?: boolean }
     * Forwards the request to https://ollama.if.unismuh.ac.id/api/generate (no API key)
     * Attaches application context (user profile + recent competitions) into the prompt.
     */
    static async chat(req, res, next) {
        try {
            let { model, prompt, stream = false } = req.body || {};
            if (!prompt) {
                return res.status(400).json({ success: false, message: 'Request Error', data: null, errors: 'prompt is required' });
            }
            if (!model)
                model = DEFAULT_MODEL;
            else if (MODEL_ALIASES[model])
                model = MODEL_ALIASES[model];
            // Try to identify user from X-API-TOKEN or Authorization header (optional)
            let userSummary = 'anonymous';
            let userId;
            try {
                const token = String(req.get('X-API-TOKEN') || (req.get('Authorization') || '').replace(/^Bearer\s+/i, '') || '');
                if (token) {
                    const decoded = jwt_1.JWT.verify(token);
                    if (decoded && decoded.id) {
                        const user = await user_model_1.default.findById(decoded.id).select('username role email isVerified').lean();
                        if (user) {
                            userSummary = `${user.username} (${user.role})${user.isVerified ? ' verified' : ''}`;
                            userId = String(decoded.id);
                        }
                    }
                }
            }
            catch (e) {
                // ignore token parse errors — treat as anonymous
            }
            // Susun konteks seluruh aplikasi (lomba, prestasi, cari tim, data pribadi user)
            // sesuai kata kunci pada pesan — lihat ChatContextService untuk logikanya.
            const appContext = await chat_context_service_1.ChatContextService.build(String(prompt), userId);
            // Build a structured prompt with system + context + user
            const finalPrompt = `SYSTEM: You are CampusHub assistant, an assistant with live access to CampusHub's database (competitions, achievements, team-finding posts, bookmarks, notifications). Use the CONTEXT below — it was already queried from the real database based on the user's message — to answer accurately. If the CONTEXT doesn't contain something the user asked about, say so honestly instead of guessing. Reply in Bahasa Indonesia, in short natural sentences or a plain paragraph. Only use a bullet list if you are listing 3 or more distinct items; otherwise avoid markdown formatting like bullet points, headers, or asterisks entirely.

CONTEXT:
- user: ${userSummary}

${appContext}

USER: ${prompt}`;
            const payload = { model, prompt: finalPrompt, stream };
            const headers = { 'Content-Type': 'application/json' };
            const resp = await axios_1.default.post(OLLAMA_GENERATE_URL, payload, { headers, timeout: 60000 });
            return res.status(200).json({ success: true, message: 'Chat response', data: resp.data, errors: null });
        }
        catch (err) {
            const status = err?.response?.status ?? 500;
            const respData = err?.response?.data;
            const errors = respData ?? err?.message ?? 'Chat request failed';
            return res.status(status).json({ success: false, message: 'Request Error', data: null, errors });
        }
    }
    /**
     * GET /api/chat/models
     * Daftar model yang BENAR-BENAR tersedia di server Ollama kampus (proxy /api/tags),
     * supaya client (dropdown model di frontend) tidak perlu hardcode nama+tag model.
     */
    static async models(req, res, next) {
        try {
            const resp = await axios_1.default.get(OLLAMA_TAGS_URL, { timeout: 10000 });
            const models = (resp.data?.models || [])
                // model embedding (bge-m3, nomic-embed-text, dkk.) bukan model chat — tidak relevan untuk dropdown chat
                .filter((m) => !String(m.details?.family || '').toLowerCase().includes('bert'))
                .map((m) => ({
                name: m.name,
                family: m.details?.family ?? null,
                parameterSize: m.details?.parameter_size ?? null,
            }));
            return res.status(200).json({ success: true, message: 'Models retrieved successfully', data: models, errors: null });
        }
        catch (err) {
            const status = err?.response?.status ?? 500;
            const errors = err?.response?.data ?? err?.message ?? 'Failed to fetch model list';
            return res.status(status).json({ success: false, message: 'Request Error', data: null, errors });
        }
    }
}
exports.ChatController = ChatController;
