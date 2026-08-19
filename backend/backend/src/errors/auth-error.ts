/**
 * Error autentikasi (token/sesi tidak valid).
 * Selalu dipetakan ke status 401 oleh error-middleware.
 */
export class AuthError extends Error {
    constructor(public errorMessage: string = 'Unauthorized', public message: string = 'Unauthorized') {
        super(message);
    }
}
