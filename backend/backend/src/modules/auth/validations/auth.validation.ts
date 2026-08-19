/**
 * Skema validasi zod untuk modul auth.
 * Aturan tiap field diambil dari validations/fields.ts agar konsisten.
 */
import {z, ZodType} from "zod";
import {fields} from "../../../validations/fields";

export class AuthValidation {
    /** Body register; refine memastikan password === confirmPassword. */
    static readonly REGISTER: ZodType = z.object({
        firstName: fields.firstName,
        lastName: fields.lastName,
        email: fields.email,
        username: fields.username,
        password: fields.password,
        confirmPassword: fields.confirmPassword,
        gender: fields.gender
    }).refine(data => data.password === data.confirmPassword, {
        message: 'Password do not match',
        path: ['confirmPassword']
    });

    /** Body login. */
    static readonly LOGIN: ZodType = z.object({
        username: fields.username,
        password: fields.password,
    });

    /** Body reset password; refine memastikan konfirmasi cocok. */
    static readonly RESET_PASSWORD: ZodType = z.object({
        password: fields.password,
        confirmPassword: fields.confirmPassword
    }).refine(field => field.password === field.confirmPassword, {
        message: 'Password do not match',
        path: ['confirmPassword']
    });

    /** Body login Google: ID token dari Google Identity Services. */
    static readonly GOOGLE_LOGIN: ZodType = z.object({
        idToken: fields.idToken
    });

    // Skema field tunggal (untuk query/body sederhana)
    static readonly TOKEN: ZodType = fields.token;
    static readonly EMAIL: ZodType = fields.email;
    static readonly VERIFICATION_CODE: ZodType = fields.verificationCode;
}
