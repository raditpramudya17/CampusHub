"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Model TeamPost — papan "Cari Rekan Tim" (partner finder), tanpa moderasi.
 */
const config_1 = __importDefault(require("../../../../mongoose/config"));
const mongoose_1 = require("mongoose");
const teamPostSchema = new config_1.default.Schema({
    competition: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: { createdAt: true, updatedAt: false }
});
teamPostSchema.index({ createdAt: -1 });
const TeamPostModel = config_1.default.model("TeamPost", teamPostSchema);
exports.default = TeamPostModel;
