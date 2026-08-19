/**
 * Konfigurasi aplikasi Express.
 * Merakit middleware global, router modul, dan error handler.
 */
import express from "express";
import {errorMiddleware} from "../middlewares/error-middleware";
import authRouter from "../modules/auth/routers/auth.router";
import userRouter from "../modules/user/routers/user.router";
import competitionRouter from "../modules/competition/routers/competition.router";
import chatRouter from "../modules/chat/routers/chat.router";
import bookmarkRouter from "../modules/bookmark/routers/bookmark.router";
import uploadRouter from "../modules/upload/routers/upload.router";
import achievementRouter from "../modules/achievement/routers/achievement.router";
import teamPostRouter from "../modules/teampost/routers/teampost.router";
import commentRouter from "../modules/comment/routers/comment.router";
import notificationRouter from "../modules/notification/routers/notification.router";

import swaggerUi from 'swagger-ui-express';
const swaggerDocument = require('../../swagger.json');

const web = express();

// Parsing body request: JSON dan form-urlencoded
web.use(express.json());
web.use(express.urlencoded({ extended: false }));

// Expose API docs (Swagger UI)
web.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Registrasi router per modul
web.use('/api/auth', authRouter);
web.use('/api/users', userRouter);
web.use('/api/competitions', competitionRouter);
web.use('/api/chat', chatRouter);
web.use('/api/bookmarks', bookmarkRouter);
web.use('/api/uploads', uploadRouter);
web.use('/api/achievements', achievementRouter);
web.use('/api/teamposts', teamPostRouter);
web.use('/api/comments', commentRouter);
web.use('/api/notifications', notificationRouter);

// Error handler harus dipasang paling akhir agar menangkap semua error dari route di atasnya
web.use(errorMiddleware);

export default web;
