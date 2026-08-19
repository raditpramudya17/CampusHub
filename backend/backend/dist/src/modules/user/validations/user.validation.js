"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidation = void 0;
/**
 * Skema validasi zod untuk modul user.
 * Aturan tiap field diambil dari validations/fields.ts agar konsisten.
 */
const zod_1 = require("zod");
const fields_1 = require("../../../validations/fields");
class UserValidation {
    /**
     * Body update profil — semua field opsional (partial update),
     * tetapi minimal satu field harus dikirim.
     * Email TIDAK bisa diubah lewat sini karena terikat verifikasi.
     */
    static UPDATE = zod_1.z.object({
        firstName: fields_1.fields.firstName.optional(),
        lastName: fields_1.fields.lastName.optional(),
        username: fields_1.fields.username.optional(),
        gender: fields_1.fields.gender.optional()
    }).refine(data => Object.keys(data).length > 0, {
        message: 'Minimal satu field harus diisi'
    });
    /**
     * Body ganti password — wajib password lama + konfirmasi password baru,
     * dan password baru tidak boleh sama dengan yang lama.
     */
    static UPDATE_PASSWORD = zod_1.z.object({
        oldPassword: fields_1.fields.password,
        newPassword: fields_1.fields.password,
        confirmPassword: fields_1.fields.confirmPassword
    }).refine(data => data.newPassword === data.confirmPassword, {
        message: 'Password do not match',
        path: ['confirmPassword']
    }).refine(data => data.oldPassword !== data.newPassword, {
        message: 'Password baru tidak boleh sama dengan password lama',
        path: ['newPassword']
    });
    /** Body ubah role user — admin-only (dicek di controller). */
    static UPDATE_ROLE = zod_1.z.object({
        role: zod_1.z.enum(['mahasiswa', 'dosen', 'ukm', 'eksternal', 'admin'], 'role tidak valid')
    });
}
exports.UserValidation = UserValidation;
