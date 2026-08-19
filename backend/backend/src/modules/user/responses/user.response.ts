/**
 * Fungsi pembentuk response modul user.
 * Memastikan hanya field aman yang dikirim ke client (password tidak pernah ikut).
 */
import type {UserResponse, UserTypes} from "../../../types/user.types";

/** Response data user: field profil tanpa data sensitif. */
export const userResponse = (user: UserTypes): UserResponse => {
    return {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        gender: user.gender,
        role: user.role,
        isVerified: user.isVerified,
        hasGoogleLinked: !!user.googleId
    }
}
