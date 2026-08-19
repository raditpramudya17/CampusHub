/**
 * Error bisnis/aplikasi dengan status HTTP kustom.
 * Contoh: throw new ResponseError(404, 'User not found')
 * Ditangani oleh error-middleware dan dipetakan ke response JSON.
 */
export class ResponseError extends Error {
    constructor(public status: number, public message: string) {
        super(message);
    }
}
