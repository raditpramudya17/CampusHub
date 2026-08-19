/**
 * BookmarkController — lapisan HTTP fitur simpan lomba.
 * Semua route wajib login (auth-middleware di router).
 */
import type {NextFunction, Response} from "express";
import type {UserRequest} from "../../../types/user.types";
import type {CompetitionResponse} from "../../../types/competition.types";
import {BookmarkService} from "../services/bookmark.service";
import {success} from "../../../utils/api-response";

export class BookmarkController {
    /** POST /api/bookmarks/:competitionId — simpan lomba. */
    static async save(req: UserRequest, res: Response, next: NextFunction): Promise<Response> {
        await BookmarkService.save(req.user!._id, String(req.params.competitionId));
        return success(res, 200, 'Competition saved', null);
    }

    /** DELETE /api/bookmarks/:competitionId — hapus dari simpanan. */
    static async remove(req: UserRequest, res: Response, next: NextFunction): Promise<Response> {
        await BookmarkService.remove(req.user!._id, String(req.params.competitionId));
        return success(res, 200, 'Competition unsaved', null);
    }

    /** GET /api/bookmarks — daftar lomba yang disimpan user yang login. */
    static async getMine(req: UserRequest, res: Response, next: NextFunction): Promise<Response> {
        const response: CompetitionResponse[] = await BookmarkService.getMine(req.user!._id);
        return success(res, 200, 'Saved competitions retrieved successfully', response);
    }
}
