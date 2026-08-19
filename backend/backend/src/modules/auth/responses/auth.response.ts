/**
 * Fungsi pembentuk response modul auth.
 * Memastikan hanya field aman yang dikirim ke client (password tidak pernah ikut).
 */
import type {UserTypes} from "../../../types/user.types";
import type {AuthRegisterResponse, AuthResponse} from "../../../types/auth.types";

/** Response login: data user + kedua token. */
export const authResponse = (user: UserTypes, accessToken: string, refreshToken: string): AuthResponse => {
    return {
        email: user.email,
        username: user.username,
        id: user._id.toString(),
        accessToken: accessToken,
        refreshToken: refreshToken
    }
}

/** Response register: tanpa token karena user harus verifikasi email dulu. */
export const registerResponse = (user: UserTypes): AuthRegisterResponse => {
    return {
        email: user.email,
        username: user.username,
        id: user._id.toString()
    }
}
