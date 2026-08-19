/**
 * Tipe-tipe yang berkaitan dengan bookmark (lomba yang disimpan user).
 */
import {Types} from "mongoose";

/** Bentuk dokumen Bookmark di database. */
export interface BookmarkTypes {
    _id: Types.ObjectId;
    user: Types.ObjectId;
    competition: Types.ObjectId;
    remindedThresholds: number[];
    createdAt: Date;
}
