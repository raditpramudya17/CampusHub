"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerResponse = exports.authResponse = void 0;
/** Response login: data user + kedua token. */
const authResponse = (user, accessToken, refreshToken) => {
    return {
        email: user.email,
        username: user.username,
        id: user._id.toString(),
        accessToken: accessToken,
        refreshToken: refreshToken
    };
};
exports.authResponse = authResponse;
/** Response register: tanpa token karena user harus verifikasi email dulu. */
const registerResponse = (user) => {
    return {
        email: user.email,
        username: user.username,
        id: user._id.toString()
    };
};
exports.registerResponse = registerResponse;
