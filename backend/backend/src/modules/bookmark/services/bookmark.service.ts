/**
 * BookmarkService — logika bisnis fitur simpan lomba (Lomba Tersimpan).
 */
import {Types} from "mongoose";
import BookmarkModel from "../models/bookmark.model";
import CompetitionModel from "../../competition/models/competition.model";
import {competitionResponse} from "../../competition/responses/competition.response";
import type {CompetitionResponse} from "../../../types/competition.types";
import {ResponseError} from "../../../errors/response-error";

export class BookmarkService {
    /** Simpan lomba. Idempoten — memanggil dua kali tidak error/duplikat. */
    static async save(userId: Types.ObjectId, competitionId: string): Promise<void> {
        if (!Types.ObjectId.isValid(competitionId)) {
            throw new ResponseError(404, 'Competition not found');
        }
        const competition = await CompetitionModel.findById(competitionId);
        if (!competition) {
            throw new ResponseError(404, 'Competition not found');
        }

        await BookmarkModel.updateOne(
            {user: userId, competition: competitionId},
            {$setOnInsert: {user: userId, competition: competitionId}},
            {upsert: true}
        );
    }

    /** Hapus simpanan. Idempoten — aman dipanggil walau belum/tidak pernah tersimpan. */
    static async remove(userId: Types.ObjectId, competitionId: string): Promise<void> {
        await BookmarkModel.deleteOne({user: userId, competition: competitionId});
    }

    /** Ambil semua lomba yang disimpan user, urut dari yang terbaru disimpan. */
    static async getMine(userId: Types.ObjectId): Promise<CompetitionResponse[]> {
        const bookmarks = await BookmarkModel.find({user: userId})
            .sort({createdAt: -1})
            .populate({
                path: 'competition',
                populate: {path: 'author', select: 'username email'}
            });

        return bookmarks
            .filter((b: any) => b.competition) // lewati jika lomba yang disimpan sudah dihapus
            .map((b: any) => competitionResponse(b.competition));
    }
}
