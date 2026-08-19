/**
 * Konfigurasi koneksi MongoDB.
 * Semua model meng-import mongoose dari file ini agar koneksi
 * dan logging query konsisten di seluruh aplikasi.
 */
import logger from "../src/applications/logging";
import mongoose from "mongoose";
import "dotenv/config";

// Koneksi dibuka sekali saat modul ini pertama kali di-import
mongoose.connect(process.env.MONGODB_URI as string)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(`MongoDB Connection error: ${err}`));

// Mode debug: setiap query Mongoose dicatat ke log (collection, method, isi query)
mongoose.set("debug", (collectionName, method, query, doc) => {
    logger.info({
        collection: collectionName,
        method,
        query,
        doc,
    }, "Mongoose Query Executed");
});

export default mongoose;
