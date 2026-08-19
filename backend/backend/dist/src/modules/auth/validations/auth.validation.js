"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthValidation = void 0;
/**
 * Skema validasi zod untuk modul auth.
 * Aturan tiap field diambil dari validations/fields.ts agar konsisten.
 */
const zod_1 = require("zod");
const fields_1 = require("../../../validations/fields");
class AuthValidation {
    /** Body register; refine memastikan password === confirmPassword. */
    static REGISTER = zod_1.z.object({
        firstName: fields_1.fields.firstName,
        lastName: fields_1.fields.lastName,
        email: fields_1.fields.email,
        username: fields_1.fields.username,
        password: fields_1.fields.password,
        confirmPassword: fields_1.fields.confirmPassword,
        gender: fields_1.fields.gender
    }).refine(data => data.password === data.confirmPassword, {
        message: 'Password do not match',
        path: ['confirmPassword']
    });
    /** Body login. */
    static LOGIN = zod_1.z.object({
        username: fields_1.fields.username,
        password: fields_1.fields.password,
    });
    /** Body reset password; refine memastikan konfirmasi cocok. */
    static RESET_PASSWORD = zod_1.z.object({
        password: fields_1.fields.password,
        confirmPassword: fields_1.fields.confirmPassword
    }).refine(field => field.password === field.confirmPassword, {
        message: 'Password do not match',
        path: ['confirmPassword']
    });
    /** Body login Google: ID token dari Google Identity Services. */
    static GOOGLE_LOGIN = zod_1.z.object({
        idToken: fields_1.fields.idToken
    });
    // Skema field tunggal (untuk query/body sederhana)
    static TOKEN = fields_1.fields.token;
    static EMAIL = fields_1.fields.email;
    static VERIFICATION_CODE = fields_1.fields.verificationCode;
}
exports.AuthValidation = AuthValidation;
