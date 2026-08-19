"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Router modul upload — unggah file poster lomba ke MinIO.
 * Path relatif terhadap /api/uploads (di-mount di applications/web.ts).
 */
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_middleware_1 = require("../../../middlewares/auth-middleware");
const response_error_1 = require("../../../errors/response-error");
const upload_controller_1 = require("../controllers/upload.controller");
// File ditampung di memori dulu (bukan disk) — langsung diteruskan ke MinIO di controller
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
            return cb(new Error('Hanya file JPG/PNG yang diizinkan'));
        }
        cb(null, true);
    }
});
/** Bungkus multer supaya error validasinya (tipe/ukuran file) jadi 400 rapi, bukan 500. */
function posterUpload(req, res, next) {
    upload.single('poster')(req, res, (err) => {
        if (err)
            return next(new response_error_1.ResponseError(400, err.message || 'Upload gagal'));
        next();
    });
}
const uploadRouter = (0, express_1.Router)();
uploadRouter.post('/poster', auth_middleware_1.authMiddleware, posterUpload, upload_controller_1.UploadController.poster);
exports.default = uploadRouter;
