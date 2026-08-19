"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const node_path_1 = __importDefault(require("node:path"));
const node_crypto_1 = require("node:crypto");
const api_response_1 = require("../../../utils/api-response");
const response_error_1 = require("../../../errors/response-error");
const minio_1 = require("../../../utils/minio");
class UploadController {
    /** POST /api/uploads/poster — unggah poster lomba ke MinIO, mengembalikan URL publiknya. */
    static async poster(req, res, next) {
        if (!req.file) {
            throw new response_error_1.ResponseError(400, 'File poster wajib diunggah');
        }
        const ext = node_path_1.default.extname(req.file.originalname).toLowerCase();
        const objectName = `posters/${(0, node_crypto_1.randomUUID)()}${ext}`;
        const url = await (0, minio_1.uploadObject)(objectName, req.file.buffer, req.file.mimetype);
        return (0, api_response_1.success)(res, 201, 'Poster uploaded successfully', { url });
    }
}
exports.UploadController = UploadController;
