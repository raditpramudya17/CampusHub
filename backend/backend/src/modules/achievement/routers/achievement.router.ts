/**
 * Router modul achievement — mapping URL ke method AchievementController.
 * Path relatif terhadap /api/achievements (di-mount di applications/web.ts).
 */
import {Router} from "express";
import {AchievementController} from "../controllers/achievement.controller";
import {adminMiddleware, authMiddleware, optionalAuthMiddleware} from "../../../middlewares/auth-middleware";

const achievementRouter: Router = Router();

achievementRouter.post('/', authMiddleware, AchievementController.create);
achievementRouter.get('/', optionalAuthMiddleware, AchievementController.getAll);
achievementRouter.patch('/:id/approve', authMiddleware, adminMiddleware, AchievementController.approve);
achievementRouter.patch('/:id/reject', authMiddleware, adminMiddleware, AchievementController.reject);

export default achievementRouter;
