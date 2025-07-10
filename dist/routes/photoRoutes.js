"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const Photo_1 = __importDefault(require("../models/Photo"));
const Comment_1 = __importDefault(require("../models/Comment"));
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ dest: 'uploads/' });
// POST /json/photo - Create a new photo post
router.post('/photo', auth_1.authMiddleware, upload.single('img'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user || !user.id) {
            return res.status(401).json({ error: 'Usuário não possui permissão' });
        }
        const { nome, peso, idade } = req.body;
        if (!nome || !peso || !idade || !req.file) {
            return res.status(422).json({ error: 'Dados incompletos' });
        }
        const photo = new Photo_1.default({
            title: nome,
            content: nome,
            author: user.id,
            imageUrl: `/uploads/${req.file.filename}`, // Adjust based on storage solution
            peso,
            idade,
            acessos: 0,
        });
        yield photo.save();
        return res.status(201).json({
            post_author: user.id,
            post_type: 'photo',
            post_status: 'publish',
            post_title: nome,
            post_content: nome,
            files: req.file,
            meta_input: { peso, idade, acessos: 0 },
        });
    }
    catch (error) {
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
}));
// GET /json/photo/:id - Fetch a single photo with comments
router.get('/photo/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const photo = yield Photo_1.default.findById(req.params.id).populate('author', 'username');
        if (!photo) {
            return res.status(404).json({ error: 'Post não encontrado' });
        }
        photo.acessos += 1;
        yield photo.save();
        const comments = yield Comment_1.default.find({ post: photo._id }).populate('author', 'username');
        const response = {
            photo: {
                id: photo._id,
                author: photo.author ? photo.author.username : 'Unknown',
                title: photo.title,
                date: photo.createdAt,
                src: photo.imageUrl,
                peso: photo.peso,
                idade: photo.idade,
                acessos: photo.acessos,
                total_comments: comments.length,
            },
            comments: comments.map((comment) => ({
                comment_ID: comment._id,
                comment_post_ID: comment.post,
                comment_author: comment.author ? comment.author.username : 'Unknown',
                comment_content: comment.content,
                comment_date: comment.createdAt,
            })),
        };
        return res.status(200).json(response);
    }
    catch (error) {
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
}));
// GET /json/photo - Fetch photos with pagination and optional user filter
router.get('/photo', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _total = parseInt(req.query._total) || 6;
        const _page = parseInt(req.query._page) || 1;
        const _user = req.query._user;
        let authorId = null;
        if (_user) {
            const user = yield User_1.default.findOne({ username: _user });
            if (user)
                authorId = user._id;
        }
        const query = {};
        if (authorId)
            query.author = authorId;
        const photos = yield Photo_1.default.find(query)
            .populate('author', 'username')
            .skip((_page - 1) * _total)
            .limit(_total);
        const response = yield Promise.all(photos.map((photo) => __awaiter(void 0, void 0, void 0, function* () {
            return ({
                id: photo._id,
                author: photo.author ? photo.author.username : 'Unknown',
                title: photo.title,
                date: photo.createdAt,
                src: photo.imageUrl,
                peso: photo.peso,
                idade: photo.idade,
                acessos: photo.acessos,
                total_comments: yield Comment_1.default.countDocuments({ post: photo._id }),
            });
        })));
        return res.status(200).json(response);
    }
    catch (error) {
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
}));
// DELETE /json/photo/:id - Delete a photo post
router.delete('/photo/:id', auth_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const photo = yield Photo_1.default.findById(req.params.id);
        if (!photo || photo.author.toString() !== user.id) {
            return res.status(401).json({ error: 'Sem permissão' });
        }
        yield Photo_1.default.deleteOne({ _id: req.params.id });
        yield Comment_1.default.deleteMany({ post: req.params.id });
        return res.status(200).json('Post deletado');
    }
    catch (error) {
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
}));
exports.default = router;
