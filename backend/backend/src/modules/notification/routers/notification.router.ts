/**
 * Router modul notification — mapping URL ke method NotificationController.
 * Path relatif terhadap /api/notifications (di-mount di applications/web.ts).
 * Seluruh endpoint wajib login (notifikasi selalu milik diri sendiri).
 */
import {Router} from "express";
import {NotificationController} from "../controllers/notification.controller";
import {authMiddleware} from "../../../middlewares/auth-middleware";

const notificationRouter: Router = Router();

notificationRouter.get('/', authMiddleware, NotificationController.getMine);
notificationRouter.patch('/read-all', authMiddleware, NotificationController.markAllRead);
notificationRouter.patch('/:id/read', authMiddleware, NotificationController.markRead);

export default notificationRouter;
