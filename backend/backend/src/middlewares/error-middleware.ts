/**
 * Error handler terpusat (middleware error Express).
 * Semua error yang dilempar controller/service via next(e) berakhir di sini,
 * lalu dipetakan ke response JSON ApiResponse sesuai jenis errornya.
 */
import type {NextFunction, Request, Response} from "express";
import type {ApiResponse} from "../types/common.types";
import {ZodError} from "zod";
import {ResponseError} from "../errors/response-error";
import {MongooseError} from "mongoose";
import {JsonWebTokenError, TokenExpiredError} from "jsonwebtoken";
import {AuthError} from "../errors/auth-error";
import {fail} from "../utils/api-response";

export const errorMiddleware = (error: Error, req: Request, res: Response<ApiResponse<null>>, next: NextFunction): Response => {
    // Validasi zod gagal → 400 dengan daftar pesan per field
    if (error instanceof ZodError) {
        return fail(res, 400, 'Validation Error', error.issues.map(e => `${e.path}: ${e.message}`));
    }

    // Error bisnis → status sesuai yang ditentukan saat dilempar
    if (error instanceof ResponseError) {
        return fail(res, error.status, 'Request Error', error.message);
    }

    // Error dari Mongoose (validasi skema, cast error, dsb.)
    if (error instanceof MongooseError) {
        return fail(res, 400, 'Mongoose Validation Error', error.message);
    }

    // Error autentikasi (token hilang, sesi tidak ada, dsb.)
    if (error instanceof AuthError) {
        return fail(res, 401, error.message, error.errorMessage);
    }

    // Dicek SEBELUM JsonWebTokenError karena TokenExpiredError adalah subclass-nya
    if (error instanceof TokenExpiredError) {
        return fail(res, 401, 'Unauthorized', 'Token Expired');
    }

    // JWT rusak / signature tidak cocok
    if (error instanceof JsonWebTokenError) {
        return fail(res, 401, 'Unauthorized', 'Invalid Token');
    }

    // Fallback: error tak terduga → 500
    return fail(res, 500, 'internal server error', error.message);
}
