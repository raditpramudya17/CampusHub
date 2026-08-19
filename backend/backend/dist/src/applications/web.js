"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Konfigurasi aplikasi Express.
 * Merakit middleware global, router modul, dan error handler.
 */
const express_1 = __importDefault(require("express"));
const error_middleware_1 = require("../middlewares/error-middleware");
const auth_router_1 = __importDefault(require("../modules/auth/routers/auth.router"));
const user_router_1 = __importDefault(require("../modules/user/routers/user.router"));
const competition_router_1 = __importDefault(require("../modules/competition/routers/competition.router"));
const chat_router_1 = __importDefault(require("../modules/chat/routers/chat.router"));
const bookmark_router_1 = __importDefault(require("../modules/bookmark/routers/bookmark.router"));
const upload_router_1 = __importDefault(require("../modules/upload/routers/upload.router"));
const achievement_router_1 = __importDefault(require("../modules/achievement/routers/achievement.router"));
const teampost_router_1 = __importDefault(require("../modules/teampost/routers/teampost.router"));
const comment_router_1 = __importDefault(require("../modules/comment/routers/comment.router"));
const notification_router_1 = __importDefault(require("../modules/notification/routers/notification.router"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swaggerDocument = require('../../swagger.json');
const web = (0, express_1.default)();
// Parsing body request: JSON dan form-urlencoded
web.use(express_1.default.json());
web.use(express_1.default.urlencoded({ extended: false }));
// Expose API docs (Swagger UI)
web.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
// Registrasi router per modul
web.use('/api/auth', auth_router_1.default);
web.use('/api/users', user_router_1.default);
web.use('/api/competitions', competition_router_1.default);
web.use('/api/chat', chat_router_1.default);
web.use('/api/bookmarks', bookmark_router_1.default);
web.use('/api/uploads', upload_router_1.default);
web.use('/api/achievements', achievement_router_1.default);
web.use('/api/teamposts', teampost_router_1.default);
web.use('/api/comments', comment_router_1.default);
web.use('/api/notifications', notification_router_1.default);
// Error handler harus dipasang paling akhir agar menangkap semua error dari route di atasnya
web.use(error_middleware_1.errorMiddleware);
exports.default = web;
