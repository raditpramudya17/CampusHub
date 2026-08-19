"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const zod_1 = require("zod");
const response_error_1 = require("../errors/response-error");
const mongoose_1 = require("mongoose");
const jsonwebtoken_1 = require("jsonwebtoken");
const auth_error_1 = require("../errors/auth-error");
const api_response_1 = require("../utils/api-response");
const errorMiddleware = (error, req, res, next) => {
    // Validasi zod gagal → 400 dengan daftar pesan per field
    if (error instanceof zod_1.ZodError) {
        return (0, api_response_1.fail)(res, 400, 'Validation Error', error.issues.map(e => `${e.path}: ${e.message}`));
    }
    // Error bisnis → status sesuai yang ditentukan saat dilempar
    if (error instanceof response_error_1.ResponseError) {
        return (0, api_response_1.fail)(res, error.status, 'Request Error', error.message);
    }
    // Error dari Mongoose (validasi skema, cast error, dsb.)
    if (error instanceof mongoose_1.MongooseError) {
        return (0, api_response_1.fail)(res, 400, 'Mongoose Validation Error', error.message);
    }
    // Error autentikasi (token hilang, sesi tidak ada, dsb.)
    if (error instanceof auth_error_1.AuthError) {
        return (0, api_response_1.fail)(res, 401, error.message, error.errorMessage);
    }
    // Dicek SEBELUM JsonWebTokenError karena TokenExpiredError adalah subclass-nya
    if (error instanceof jsonwebtoken_1.TokenExpiredError) {
        return (0, api_response_1.fail)(res, 401, 'Unauthorized', 'Token Expired');
    }
    // JWT rusak / signature tidak cocok
    if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
        return (0, api_response_1.fail)(res, 401, 'Unauthorized', 'Invalid Token');
    }
    // Fallback: error tak terduga → 500
    return (0, api_response_1.fail)(res, 500, 'internal server error', error.message);
};
exports.errorMiddleware = errorMiddleware;
