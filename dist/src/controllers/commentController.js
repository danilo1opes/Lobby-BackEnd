"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComment = void 0;
const Comment_1 = __importDefault(require("../models/Comment"));
const Photo_1 = __importDefault(require("../models/Photo"));
const createComment = async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;
    try {
        const photo = await Photo_1.default.findById(id);
        if (!photo)
            return res.status(404).json({ error: 'Post não encontrado' });
        const comment = await Comment_1.default.create({
            text,
            author: req.user.id,
            photo: id,
        });
        photo.comments.push(comment._id);
        await photo.save();
        const populatedComment = await comment.populate('author', 'email');
        return res.status(201).json(populatedComment);
    }
    catch (error) {
        return res.status(500).json({ error: 'Erro ao criar comentário' });
    }
};
exports.createComment = createComment;
