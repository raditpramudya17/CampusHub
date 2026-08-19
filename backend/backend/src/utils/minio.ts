/**
 * Klien MinIO untuk penyimpanan objek (poster lomba, dsb).
 * Konfigurasi dari .env — lihat ensureBucket() yang dipanggil sekali saat server start
 * (main.ts) untuk memastikan bucket ada dan bisa dibaca publik tanpa autentikasi.
 */
import {Client} from "minio";
import 'dotenv/config';
import logger from "../applications/logging";

const ENDPOINT = process.env.MINIO_ENDPOINT as string;
const PORT = Number(process.env.MINIO_PORT) || 9000;
const USE_SSL = process.env.MINIO_USE_SSL === 'true';
const ACCESS_KEY = process.env.MINIO_ACCESS_KEY as string;
const SECRET_KEY = process.env.MINIO_SECRET_KEY as string;
const BUCKET = process.env.MINIO_BUCKET as string;
const PUBLIC_URL = (process.env.MINIO_PUBLIC_URL || `http://${ENDPOINT}:${PORT}`).replace(/\/$/, '');

export const minioClient = new Client({
    endPoint: ENDPOINT,
    port: PORT,
    useSSL: USE_SSL,
    accessKey: ACCESS_KEY,
    secretKey: SECRET_KEY,
});

/** Kebijakan bucket: siapa saja boleh GetObject (baca), tapi tidak bisa listing/tulis. */
const publicReadPolicy = (bucket: string) => JSON.stringify({
    Version: '2012-10-17',
    Statement: [{
        Effect: 'Allow',
        Principal: {AWS: ['*']},
        Action: ['s3:GetObject'],
        Resource: [`arn:aws:s3:::${bucket}/*`]
    }]
});

/** Pastikan bucket ada + kebijakan publik-baca sudah terpasang. Dipanggil sekali saat server start. */
export async function ensureBucket(): Promise<void> {
    const exists = await minioClient.bucketExists(BUCKET);
    if (!exists) {
        await minioClient.makeBucket(BUCKET);
        logger.info(`MinIO bucket "${BUCKET}" dibuat`);
    }
    await minioClient.setBucketPolicy(BUCKET, publicReadPolicy(BUCKET));
    logger.info(`MinIO siap — bucket "${BUCKET}" @ ${PUBLIC_URL}`);
}

/** Unggah buffer ke MinIO, kembalikan URL publik lengkap ke objeknya. */
export async function uploadObject(objectName: string, buffer: Buffer, mimetype: string): Promise<string> {
    await minioClient.putObject(BUCKET, objectName, buffer, buffer.length, {'Content-Type': mimetype});
    return `${PUBLIC_URL}/${BUCKET}/${objectName}`;
}
