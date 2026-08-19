/**
 * UploadController — lapisan HTTP modul upload.
 */
import type {NextFunction, Request, Response} from "express";
import path from "node:path";
import {randomUUID} from "node:crypto";
import {success} from "../../../utils/api-response";
import {ResponseError} from "../../../errors/response-error";
import {uploadObject} from "../../../utils/minio";

export class UploadController {
    /** POST /api/uploads/poster — unggah poster lomba ke MinIO, mengembalikan URL publiknya. */
    static async poster(req: Request, res: Response, next: NextFunction): Promise<Response> {
        if (!req.file) {
            throw new ResponseError(400, 'File poster wajib diunggah');
        }
        const ext = path.extname(req.file.originalname).toLowerCase();
        const objectName = `posters/${randomUUID()}${ext}`;
        const url = await uploadObject(objectName, req.file.buffer, req.file.mimetype);
        return success(res, 201, 'Poster uploaded successfully', {url});
    }
}
