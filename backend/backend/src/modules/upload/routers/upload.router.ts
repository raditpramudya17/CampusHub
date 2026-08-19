/**
 * Router modul upload — unggah file poster lomba ke MinIO.
 * Path relatif terhadap /api/uploads (di-mount di applications/web.ts).
 */
import {Router, type NextFunction, type Request, type Response} from "express";
import multer from "multer";
import {authMiddleware} from "../../../middlewares/auth-middleware";
import {ResponseError} from "../../../errors/response-error";
import {UploadController} from "../controllers/upload.controller";

// File ditampung di memori dulu (bukan disk) — langsung diteruskan ke MinIO di controller
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {fileSize: 2 * 1024 * 1024}, // 2MB
    fileFilter: (req, file, cb) => {
        if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
            return cb(new Error('Hanya file JPG/PNG yang diizinkan'));
        }
        cb(null, true);
    }
});

/** Bungkus multer supaya error validasinya (tipe/ukuran file) jadi 400 rapi, bukan 500. */
function posterUpload(req: Request, res: Response, next: NextFunction) {
    upload.single('poster')(req, res, (err: any) => {
        if (err) return next(new ResponseError(400, err.message || 'Upload gagal'));
        next();
    });
}

const uploadRouter: Router = Router();

uploadRouter.post('/poster', authMiddleware, posterUpload, UploadController.poster);

export default uploadRouter;
