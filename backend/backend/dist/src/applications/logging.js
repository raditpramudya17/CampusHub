"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Logger aplikasi berbasis pino.
 * Level log dikendalikan lewat env LOG_LEVEL (default: debug).
 */
const pino_1 = __importDefault(require("pino"));
const logger = (0, pino_1.default)({
    level: process.env.LOG_LEVEL || "debug",
});
exports.default = logger;
