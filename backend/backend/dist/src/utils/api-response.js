"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fail = exports.success = void 0;
const success = (res, status, message, data) => {
    return res.status(status).json({
        success: true,
        message,
        data,
        errors: null
    });
};
exports.success = success;
const fail = (res, status, message, errors) => {
    return res.status(status).json({
        success: false,
        message,
        data: null,
        errors
    });
};
exports.fail = fail;
