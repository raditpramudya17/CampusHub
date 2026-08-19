/**
 * Model Bookmark — penanda "lomba disimpan" oleh user (fitur Lomba Tersimpan).
 */
import mongoose from "../../../../mongoose/config";
import {Schema} from "mongoose";
import type {BookmarkTypes} from "../../../types/bookmark.types";

const bookmarkSchema = new mongoose.Schema<BookmarkTypes>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    competition: {
        type: Schema.Types.ObjectId,
        ref: 'Competition',
        required: true
    },
    // Ambang H- (7/3/1) yang sudah dikirim reminder-nya, agar tidak dikirim berulang (lihat ReminderService)
    remindedThresholds: {
        type: [Number],
        default: []
    }
}, {
    timestamps: {createdAt: true, updatedAt: false}
})

// Satu user hanya bisa menyimpan satu lomba sekali (dipakai juga untuk upsert idempoten di service)
bookmarkSchema.index({user: 1, competition: 1}, {unique: true});

const BookmarkModel = mongoose.model("Bookmark", bookmarkSchema);

export default BookmarkModel;
