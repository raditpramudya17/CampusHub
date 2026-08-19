/**
 * Model TeamPost — papan "Cari Rekan Tim" (partner finder), tanpa moderasi.
 */
import mongoose from "../../../../mongoose/config";
import {Schema} from "mongoose";
import type {TeamPostTypes} from "../../../types/teampost.types";

const teamPostSchema = new mongoose.Schema<TeamPostTypes>({
    competition: {
        type: Schema.Types.ObjectId,
        ref: 'Competition',
        default: null
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    rolesNeeded: {
        type: String,
        required: true
    },
    contactInfo: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: {createdAt: true, updatedAt: false}
})

teamPostSchema.index({createdAt: -1});

const TeamPostModel = mongoose.model("TeamPost", teamPostSchema);

export default TeamPostModel;
