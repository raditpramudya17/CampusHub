/**
 * Tipe-tipe request/response untuk modul auth.
 */
import type {UserTypes} from "./user.types";
import {Types} from "mongoose";

/** Dokumen Session: menyimpan refresh token per login. */
export interface SessionTypes {
    user: Types.ObjectId;
    token: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Body request register: data user + konfirmasi password.
 * password & gender di-override non-null: UserTypes mengizinkan null untuk akun Google,
 * tapi register manual selalu wajib mengisi keduanya.
 */
export type AuthRegisterRequest = Pick<UserTypes,
    'firstName' | 'lastName' | 'email' | 'username'> & {
    password: string;
    gender: "male" | "female";
    confirmPassword: string;
};

/** Body request login. */
export type AuthLoginRequest = Pick<UserTypes, 'username'> & {
    password: string;
};

/** Response login: data user + access & refresh token. */
export type AuthResponse = Pick<UserTypes,
    'username' | 'email'> & {
    id: string;
    accessToken: string;
    refreshToken: string;
};

/** Response register: tanpa token, karena user wajib verifikasi email dulu. */
export type AuthRegisterResponse = Pick<UserTypes,
    'username' | 'email'> & {
    id: string;
};

/** Response yang hanya berisi satu token (refresh-token, verify-code). */
export type AuthTokenResponse = {
    token: string;
};

/** Body request login lewat Google — ID token dari Google Identity Services (frontend). */
export type AuthGoogleRequest = {
    idToken: string;
};

/** Body request reset password. */
export type AuthResetPasswordRequest = {
    password: string,
    confirmPassword: string
}
