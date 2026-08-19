/**
 * Tipe-tipe yang berkaitan dengan user.
 */
import type {Request} from "express";
import {Types} from "mongoose";

/** Role pengguna — menentukan hak akses (authorization). */
export type UserRole = "mahasiswa" | "dosen" | "ukm" | "eksternal" | "admin";

/** Bentuk dokumen User di database. */
export interface UserTypes {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    // Kosong (null) untuk akun yang dibuat lewat Google OAuth dan belum pernah set password
    password: string | null;
    gender: "male" | "female" | null;
    role: UserRole;
    isVerified: boolean;
    verificationCode: number | null;
    // id akun Google (sub claim); null untuk akun yang dibuat lewat register manual
    googleId: string | null;
}

/** Bentuk response data user yang aman dikirim ke client (tanpa password). */
export interface UserResponse {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    gender: "male" | "female" | null;
    role: UserRole;
    isVerified: boolean;
    // true jika akun terhubung ke Google — dipakai frontend untuk sembunyikan form ganti password
    hasGoogleLinked: boolean;
}

/** Body update profil — semua field opsional, minimal satu harus diisi. */
export interface UserUpdateRequest {
    firstName?: string;
    lastName?: string;
    username?: string;
    gender?: "male" | "female";
}

/** Body ganti password — wajib menyertakan password lama. */
export interface UserUpdatePasswordRequest {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

/** Request Express yang sudah membawa data user (diisi oleh auth-middleware). */
export interface UserRequest extends Request {
    user?: {
        _id: Types.ObjectId,
        email: string
    }
}
