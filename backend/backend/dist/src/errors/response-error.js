"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseError = void 0;
/**
 * Error bisnis/aplikasi dengan status HTTP kustom.
 * Contoh: throw new ResponseError(404, 'User not found')
 * Ditangani oleh error-middleware dan dipetakan ke response JSON.
 */
class ResponseError extends Error {
    status;
    message;
    constructor(status, message) {
        super(message);
        this.status = status;
        this.message = message;
    }
}
exports.ResponseError = ResponseError;
