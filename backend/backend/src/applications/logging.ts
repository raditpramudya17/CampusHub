/**
 * Logger aplikasi berbasis pino.
 * Level log dikendalikan lewat env LOG_LEVEL (default: debug).
 */
import pino from "pino";

const logger = pino({
    level: process.env.LOG_LEVEL || "debug",
});

export default logger;
