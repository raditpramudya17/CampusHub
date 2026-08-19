"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.minioClient = void 0;
exports.ensureBucket = ensureBucket;
exports.uploadObject = uploadObject;
/**
 * Klien MinIO untuk penyimpanan objek (poster lomba, dsb).
 * Konfigurasi dari .env — lihat ensureBucket() yang dipanggil sekali saat server start
 * (main.ts) untuk memastikan bucket ada dan bisa dibaca publik tanpa autentikasi.
 */
const minio_1 = require("minio");
require("dotenv/config");
const logging_1 = __importDefault(require("../applications/logging"));
const ENDPOINT = process.env.MINIO_ENDPOINT;
const PORT = Number(process.env.MINIO_PORT) || 9000;
const USE_SSL = process.env.MINIO_USE_SSL === 'true';
const ACCESS_KEY = process.env.MINIO_ACCESS_KEY;
const SECRET_KEY = process.env.MINIO_SECRET_KEY;
const BUCKET = process.env.MINIO_BUCKET;
const PUBLIC_URL = (process.env.MINIO_PUBLIC_URL || `http://${ENDPOINT}:${PORT}`).replace(/\/$/, '');
exports.minioClient = new minio_1.Client({
    endPoint: ENDPOINT,
    port: PORT,
    useSSL: USE_SSL,
    accessKey: ACCESS_KEY,
    secretKey: SECRET_KEY,
});
/** Kebijakan bucket: siapa saja boleh GetObject (baca), tapi tidak bisa listing/tulis. */
const publicReadPolicy = (bucket) => JSON.stringify({
    Version: '2012-10-17',
    Statement: [{
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucket}/*`]
        }]
});
/** Pastikan bucket ada + kebijakan publik-baca sudah terpasang. Dipanggil sekali saat server start. */
async function ensureBucket() {
    const exists = await exports.minioClient.bucketExists(BUCKET);
    if (!exists) {
        await exports.minioClient.makeBucket(BUCKET);
        logging_1.default.info(`MinIO bucket "${BUCKET}" dibuat`);
    }
    await exports.minioClient.setBucketPolicy(BUCKET, publicReadPolicy(BUCKET));
    logging_1.default.info(`MinIO siap — bucket "${BUCKET}" @ ${PUBLIC_URL}`);
}
/** Unggah buffer ke MinIO, kembalikan URL publik lengkap ke objeknya. */
async function uploadObject(objectName, buffer, mimetype) {
    await exports.minioClient.putObject(BUCKET, objectName, buffer, buffer.length, { 'Content-Type': mimetype });
    return `${PUBLIC_URL}/${BUCKET}/${objectName}`;
}
