/**
 * Skema validasi zod untuk modul user.
 * Aturan tiap field diambil dari validations/fields.ts agar konsisten.
 */
import {z, ZodType} from "zod";
import {fields} from "../../../validations/fields";

export class UserValidation {
    /**
     * Body update profil — semua field opsional (partial update),
     * tetapi minimal satu field harus dikirim.
     * Email TIDAK bisa diubah lewat sini karena terikat verifikasi.
     */
    static readonly UPDATE: ZodType = z.object({
        firstName: fields.firstName.optional(),
        lastName: fields.lastName.optional(),
        username: fields.username.optional(),
        gender: fields.gender.optional()
    }).refine(data => Object.keys(data).length > 0, {
        message: 'Minimal satu field harus diisi'
    });

    /**
     * Body ganti password — wajib password lama + konfirmasi password baru,
     * dan password baru tidak boleh sama dengan yang lama.
     */
    static readonly UPDATE_PASSWORD: ZodType = z.object({
        oldPassword: fields.password,
        newPassword: fields.password,
        confirmPassword: fields.confirmPassword
    }).refine(data => data.newPassword === data.confirmPassword, {
        message: 'Password do not match',
        path: ['confirmPassword']
    }).refine(data => data.oldPassword !== data.newPassword, {
        message: 'Password baru tidak boleh sama dengan password lama',
        path: ['newPassword']
    });

    /** Body ubah role user — admin-only (dicek di controller). */
    static readonly UPDATE_ROLE: ZodType = z.object({
        role: z.enum(['mahasiswa', 'dosen', 'ukm', 'eksternal', 'admin'], 'role tidak valid')
    });
}
