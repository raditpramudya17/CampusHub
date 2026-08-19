"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userResponse = void 0;
/** Response data user: field profil tanpa data sensitif. */
const userResponse = (user) => {
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
    };
};
exports.userResponse = userResponse;
