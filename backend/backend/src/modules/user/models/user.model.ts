/**
 * Model User — dokumen utama pengguna.
 * Password selalu disimpan sebagai hash bcrypt (di-hash di AuthService).
 */
import mongoose from "../../../../mongoose/config"
import type {UserTypes} from "../../../types/user.types";

const userSchema = new mongoose.Schema<UserTypes>({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    // Opsional: kosong untuk akun yang dibuat lewat Google OAuth dan belum pernah set password
    password: {
        type: String,
        required: false,
        default: null
    },
    // Opsional: Google tidak mengirim data gender, diisi belakangan lewat update profil
    gender: {
        type: String,
        enum: ["male", "female"],
        required: false,
        default: null
    },
    // Role tidak pernah diterima dari input register/update profil;
    // hanya bisa diubah lewat jalur khusus (admin). Default: mahasiswa.
    role: {
        type: String,
        enum: ["mahasiswa", "dosen", "ukm", "eksternal", "admin"],
        default: "mahasiswa"
    },
    // false sampai user mengklik link verifikasi email; login ditolak selama false
    isVerified: {
        type: Boolean,
        default: false
    },
    // Kode reset password 6 digit; null jika tidak sedang reset (sekali pakai)
    verificationCode: {
        type: Number,
        default: null
    },
    // id akun Google (sub claim) untuk user yang login/daftar lewat Google OAuth
    googleId: {
        type: String,
        default: null
    },
}, {
    timestamps: true
})

// Email dan username harus unik di level database
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
// sparse: banyak user punya googleId null (register manual), hanya nilai non-null yang harus unik
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
