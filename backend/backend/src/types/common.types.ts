/**
 * Tipe-tipe umum yang dipakai di seluruh aplikasi.
 */
import type {JwtPayload} from "jsonwebtoken";

/** Bentuk baku semua response API. */
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T | null;
    errors: string | string[] | null;
}

/** Payload yang disimpan di dalam JWT (id user + klaim standar JWT). */
export interface TokenPayload extends JwtPayload {
    id: string;
}

export interface Pageable<T> {
    data: Array<T>;
    paging: {
        page: number;
        size: number;
        total?: number; // total items — opsional untuk kompatibilitas
    }
}
