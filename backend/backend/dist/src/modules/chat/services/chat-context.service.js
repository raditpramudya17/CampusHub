"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatContextService = void 0;
/**
 * ChatContextService — menyusun konteks aplikasi (lomba, prestasi, cari tim, data pribadi user)
 * untuk disisipkan ke prompt chatbot, berdasarkan kata kunci pada pesan user.
 *
 * Model lokal (Ollama gemma3/gemma4) dipanggil lewat /api/generate (single prompt, bukan
 * tool-calling), jadi pendekatannya adalah "suntik konteks relevan ke teks prompt", bukan
 * function-calling — konsisten dengan pola yang sudah ada sebelumnya (5 lomba terdekat),
 * tapi sekarang mencakup seluruh koleksi (lomba, prestasi, cari tim, bookmark, notifikasi,
 * kiriman milik user) dan dipilih sesuai kata kunci di pesan, bukan selalu satu daftar tetap.
 */
const mongoose_1 = require("mongoose");
const competition_model_1 = __importDefault(require("../../competition/models/competition.model"));
const teampost_model_1 = __importDefault(require("../../teampost/models/teampost.model"));
const achievement_model_1 = __importDefault(require("../../achievement/models/achievement.model"));
const bookmark_model_1 = __importDefault(require("../../bookmark/models/bookmark.model"));
const notification_model_1 = __importDefault(require("../../notification/models/notification.model"));
const MAX_ITEMS = 8;
const CATEGORY_KEYWORDS = [
    "teknologi", "bisnis", "seni", "olahraga", "akademik", "desain",
    "pendidikan", "sains", "debat", "sosial", "lainnya"
];
const trim = (text, len = 160) => {
    if (!text)
        return "";
    const clean = String(text).replace(/\s+/g, " ").trim();
    return clean.length > len ? clean.slice(0, len) + "…" : clean;
};
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("id-ID") : "-";
class ChatContextService {
    /** Susun blok CONTEXT lengkap untuk disisipkan ke prompt. */
    static async build(prompt, userId) {
        const lower = prompt.toLowerCase();
        const sections = [];
        let matchedSpecific = false;
        sections.push(await this.appStats());
        const category = CATEGORY_KEYWORDS.find((c) => lower.includes(c));
        if (category) {
            sections.push(await this.competitionsByCategory(category));
            matchedSpecific = true;
        }
        if (/deadline|segera tutup|mau tutup|minggu ini|mendesak|buru-buru/.test(lower)) {
            sections.push(await this.closingSoon());
            matchedSpecific = true;
        }
        if (/cari tim|rekan tim|partner|anggota tim|gabung tim|butuh tim/.test(lower)) {
            sections.push(await this.openTeamPosts());
            matchedSpecific = true;
        }
        if (/prestasi|wall of fame|juara|menang|penghargaan/.test(lower)) {
            sections.push(await this.recentAchievements());
            matchedSpecific = true;
        }
        const searched = await this.searchCompetitions(prompt);
        if (searched) {
            sections.push(searched);
            matchedSpecific = true;
        }
        if (userId && mongoose_1.Types.ObjectId.isValid(userId)) {
            if (/kiriman saya|punya saya|submission saya|lomba saya|status lomba/.test(lower)) {
                sections.push(await this.myCompetitions(userId));
                matchedSpecific = true;
            }
            if (/tersimpan|bookmark|favorit/.test(lower)) {
                sections.push(await this.myBookmarks(userId));
                matchedSpecific = true;
            }
            if (/notifikasi/.test(lower)) {
                sections.push(await this.myNotifications(userId));
                matchedSpecific = true;
            }
        }
        // Fallback hanya jika tidak ada kata kunci spesifik yang cocok sama sekali —
        // supaya jawaban tetap ketat mengikuti section yang relevan (mis. "lomba teknologi"
        // tidak tercampur daftar umum lain), tapi pertanyaan umum ("ada lomba apa aja?")
        // tetap terjawab.
        if (!matchedSpecific) {
            sections.push(await this.upcomingCompetitions());
        }
        return sections.filter(Boolean).join("\n\n");
    }
    /** Statistik ringkas seluruh aplikasi — selalu disertakan agar bot punya gambaran umum. */
    static async appStats() {
        const [byCategory, achievementCount, teamPostCount, competitionTotal] = await Promise.all([
            competition_model_1.default.aggregate([
                { $match: { status: "approved" } },
                { $group: { _id: "$category", count: { $sum: 1 } } }
            ]),
            achievement_model_1.default.countDocuments({ status: "approved" }),
            teampost_model_1.default.countDocuments(),
            competition_model_1.default.countDocuments({ status: "approved" })
        ]);
        const catTxt = byCategory.map((c) => `${c._id}: ${c.count}`).join(", ");
        return `STATISTIK APLIKASI:\n- Total lomba tayang: ${competitionTotal} (${catTxt})\n- Total prestasi di Wall of Fame: ${achievementCount}\n- Total pengumuman cari tim: ${teamPostCount}`;
    }
    static async competitionsByCategory(category) {
        const items = await competition_model_1.default.find({ status: "approved", category })
            .sort({ registrationDeadline: 1 })
            .limit(MAX_ITEMS)
            .select("title registrationDeadline organizer description")
            .lean();
        if (items.length === 0)
            return "";
        const list = items.map((c, i) => `${i + 1}) ${c.title} — deadline ${fmtDate(c.registrationDeadline)}, oleh ${c.organizer}. ${trim(c.description)}`).join("\n");
        return `LOMBA KATEGORI "${category.toUpperCase()}":\n${list}`;
    }
    static async closingSoon() {
        const now = new Date();
        const until = new Date();
        until.setDate(now.getDate() + 7);
        const items = await competition_model_1.default.find({
            status: "approved",
            registrationDeadline: { $gte: now, $lte: until }
        })
            .sort({ registrationDeadline: 1 })
            .limit(MAX_ITEMS)
            .select("title registrationDeadline organizer category")
            .lean();
        if (items.length === 0)
            return "LOMBA YANG SEGERA TUTUP (7 HARI KE DEPAN): tidak ada.";
        const list = items.map((c, i) => `${i + 1}) ${c.title} (${c.category}) — deadline ${fmtDate(c.registrationDeadline)}, oleh ${c.organizer}`).join("\n");
        return `LOMBA YANG SEGERA TUTUP (7 HARI KE DEPAN):\n${list}`;
    }
    static async openTeamPosts() {
        const items = await teampost_model_1.default.find()
            .sort({ createdAt: -1 })
            .limit(MAX_ITEMS)
            .populate("author", "username")
            .select("title rolesNeeded contactInfo author createdAt")
            .lean();
        if (items.length === 0)
            return "PENGUMUMAN CARI TIM: belum ada.";
        const list = items.map((p, i) => `${i + 1}) "${p.title}" — butuh: ${p.rolesNeeded}, kontak: ${p.contactInfo}, oleh ${p.author?.username ?? "?"}`).join("\n");
        return `PENGUMUMAN CARI TIM TERBARU:\n${list}`;
    }
    static async recentAchievements() {
        const items = await achievement_model_1.default.find({ status: "approved" })
            .sort({ createdAt: -1 })
            .limit(MAX_ITEMS)
            .select("title teamOrUser rank year prodi")
            .lean();
        if (items.length === 0)
            return "WALL OF FAME: belum ada prestasi yang dipajang.";
        const list = items.map((a, i) => `${i + 1}) ${a.rank} — "${a.title}" oleh ${a.teamOrUser} (${a.prodi}, ${a.year})`).join("\n");
        return `PRESTASI TERBARU (WALL OF FAME):\n${list}`;
    }
    /** Cari lomba yang judulnya disebut langsung di pesan user (mis. nama lomba spesifik). */
    static async searchCompetitions(prompt) {
        const words = prompt
            .split(/[^\p{L}\p{N}]+/u)
            .filter((w) => w.length >= 4 && !CATEGORY_KEYWORDS.includes(w.toLowerCase()));
        if (words.length === 0)
            return "";
        const query = words.slice(0, 8).join(" ");
        const items = await competition_model_1.default.find({ status: "approved", $text: { $search: query } }, { score: { $meta: "textScore" } })
            .sort({ score: { $meta: "textScore" } })
            .limit(5)
            .select("title registrationDeadline organizer description")
            .lean()
            .catch(() => []);
        if (!items || items.length === 0)
            return "";
        const list = items.map((c, i) => `${i + 1}) ${c.title} — deadline ${fmtDate(c.registrationDeadline)}, oleh ${c.organizer}. ${trim(c.description)}`).join("\n");
        return `LOMBA YANG MUNGKIN DIMAKSUD (hasil pencarian berdasarkan pesan user):\n${list}`;
    }
    static async myCompetitions(userId) {
        const items = await competition_model_1.default.find({ author: userId })
            .sort({ createdAt: -1 })
            .limit(MAX_ITEMS)
            .select("title status rejectionReason registrationDeadline")
            .lean();
        if (items.length === 0)
            return "KIRIMAN LOMBA MILIK USER INI: belum pernah mengunggah lomba.";
        const list = items.map((c, i) => `${i + 1}) ${c.title} — status: ${c.status}${c.status === "rejected" && c.rejectionReason ? ` (alasan: ${c.rejectionReason})` : ""}`).join("\n");
        return `KIRIMAN LOMBA MILIK USER INI:\n${list}`;
    }
    static async myBookmarks(userId) {
        const items = await bookmark_model_1.default.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(MAX_ITEMS)
            .populate("competition", "title registrationDeadline")
            .lean();
        const valid = items.filter((b) => b.competition);
        if (valid.length === 0)
            return "LOMBA TERSIMPAN (BOOKMARK) MILIK USER INI: belum ada yang disimpan.";
        const list = valid.map((b, i) => `${i + 1}) ${b.competition.title} — deadline ${fmtDate(b.competition.registrationDeadline)}`).join("\n");
        return `LOMBA TERSIMPAN (BOOKMARK) MILIK USER INI:\n${list}`;
    }
    static async myNotifications(userId) {
        const items = await notification_model_1.default.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select("title message read createdAt")
            .lean();
        if (items.length === 0)
            return "NOTIFIKASI MILIK USER INI: belum ada notifikasi.";
        const list = items.map((n, i) => `${i + 1}) [${n.read ? "sudah dibaca" : "BELUM DIBACA"}] ${n.title}: ${trim(n.message, 100)}`).join("\n");
        return `NOTIFIKASI TERBARU MILIK USER INI:\n${list}`;
    }
    static async upcomingCompetitions() {
        const items = await competition_model_1.default.find({ status: "approved" })
            .sort({ registrationDeadline: 1 })
            .limit(5)
            .select("title registrationDeadline organizer description")
            .lean();
        if (items.length === 0)
            return "";
        const list = items.map((c, i) => {
            const desc = trim(c.description);
            return `${i + 1}) ${c.title} — deadline: ${fmtDate(c.registrationDeadline)}. ${desc}`;
        }).join("\n");
        return `LOMBA DENGAN DEADLINE TERDEKAT (default, jika tidak ada kata kunci spesifik):\n${list}`;
    }
}
exports.ChatContextService = ChatContextService;
