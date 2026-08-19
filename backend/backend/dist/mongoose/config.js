"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Konfigurasi koneksi MongoDB.
 * Semua model meng-import mongoose dari file ini agar koneksi
 * dan logging query konsisten di seluruh aplikasi.
 */
const logging_1 = __importDefault(require("../src/applications/logging"));
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv/config");
// Koneksi dibuka sekali saat modul ini pertama kali di-import
mongoose_1.default.connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(`MongoDB Connection error: ${err}`));
// Mode debug: setiap query Mongoose dicatat ke log (collection, method, isi query)
mongoose_1.default.set("debug", (collectionName, method, query, doc) => {
    logging_1.default.info({
        collection: collectionName,
        method,
        query,
        doc,
    }, "Mongoose Query Executed");
});
exports.default = mongoose_1.default;
