/**
 * Helper pembentuk response sukses dan gagal.
 * Menghilangkan pengulangan objek {success, message, data, errors}
 * di controller dan error-middleware (DRY).
 */
import type {Response} from "express";
import type {ApiResponse} from "../types/common.types";

export const success = <T>(res: Response<ApiResponse<T>>, status: number, message: string, data: T): Response => {
    return res.status(status).json({
        success: true,
        message,
        data,
        errors: null
    });
}

export const fail = (res: Response<ApiResponse<null>>, status: number, message: string, errors: string | string[]): Response => {
    return res.status(status).json({
        success: false,
        message,
        data: null,
        errors
    });
}
