"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthError = void 0;
/**
 * Error autentikasi (token/sesi tidak valid).
 * Selalu dipetakan ke status 401 oleh error-middleware.
 */
class AuthError extends Error {
    errorMessage;
    message;
    constructor(errorMessage = 'Unauthorized', message = 'Unauthorized') {
        super(message);
        this.errorMessage = errorMessage;
        this.message = message;
    }
}
exports.AuthError = AuthError;
