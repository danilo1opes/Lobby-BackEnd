"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Comment_1 = __importDefault(require("../models/Comment"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/comment/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        if (!user || !user.id) {
            return res.status(401).json({ error: 'Sem permissão' });
        }
        const { comment } = req.body;
        if (!comment) {
            return res.status(422).json({ error: 'Dados incompletos' });
        }
        const newComment = new Comment_1.default({
            content: comment,
            author: user.id,
            post: req.params.id,
        });
        await newComment.save();
        const populatedComment = await Comment_1.default.findById(newComment._id).populate('author', 'username');
        if (!populatedComment) {
            return res.status(500).json({ error: 'Erro ao recuperar comentário' });
        }
        return res.status(201).json({
            comment_ID: populatedComment._id,
            comment_post_ID: populatedComment.post,
            comment_author: populatedComment.author
                ? populatedComment.author.username
                : 'Unknown',
            comment_content: populatedComment.content,
            comment_date: populatedComment.createdAt,
        });
    }
    catch (error) {
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
});
router.get('/comment/:id', async (req, res) => {
    try {
        const comments = await Comment_1.default.find({ post: req.params.id }).populate('author', 'username');
        const response = comments.map((comment) => ({
            comment_ID: comment._id,
            comment_post_ID: comment.post,
            comment_author: comment.author
                ? comment.author.username
                : 'Unknown',
            comment_content: comment.content,
            comment_date: comment.createdAt,
        }));
        return res.status(200).json(response);
    }
    catch (error) {
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
});
exports.default = router;
