"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Router modul achievement — mapping URL ke method AchievementController.
 * Path relatif terhadap /api/achievements (di-mount di applications/web.ts).
 */
const express_1 = require("express");
const achievement_controller_1 = require("../controllers/achievement.controller");
const auth_middleware_1 = require("../../../middlewares/auth-middleware");
const achievementRouter = (0, express_1.Router)();
achievementRouter.post('/', auth_middleware_1.authMiddleware, achievement_controller_1.AchievementController.create);
achievementRouter.get('/', auth_middleware_1.optionalAuthMiddleware, achievement_controller_1.AchievementController.getAll);
achievementRouter.patch('/:id/approve', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, achievement_controller_1.AchievementController.approve);
achievementRouter.patch('/:id/reject', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, achievement_controller_1.AchievementController.reject);
exports.default = achievementRouter;
