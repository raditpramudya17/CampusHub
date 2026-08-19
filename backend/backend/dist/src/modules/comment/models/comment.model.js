"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Model Comment — diskusi/tanya-jawab ringan per lomba.
 */
const config_1 = __importDefault(require("../../../../mongoose/config"));
const mongoose_1 = require("mongoose");
const commentSchema = new config_1.default.Schema({
    competition: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Competition',
        required: true
    },
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true
    }
}, {
    timestamps: { createdAt: true, updatedAt: false }
});
commentSchema.index({ competition: 1, createdAt: 1 });
const CommentModel = config_1.default.model("Comment", commentSchema);
exports.default = CommentModel;
