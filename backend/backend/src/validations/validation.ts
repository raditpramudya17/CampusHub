/**
 * Wrapper validasi zod.
 * schema.parse melempar ZodError jika data tidak valid;
 * error tersebut ditangkap oleh error-middleware dan menjadi response 400.
 */
import type {ZodType} from "zod";

export class Validation {
    static validate<T>(schema: ZodType, data: T): T {
        return schema.parse(data) as T;
    }
}
