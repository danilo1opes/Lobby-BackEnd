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
exports.deletePhoto = exports.getPhoto = exports.getPhotos = exports.createPhoto = void 0;
const Photo_1 = __importDefault(require("../models/Photo"));
const Comment_1 = __importDefault(require("../models/Comment"));
const createPhoto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { description } = req.body;
    const file = req.file;
    try {
        if (!file)
            return res.status(400).json({ error: 'Imagem não fornecida' });
        const photo = yield Photo_1.default.create({
            image: file.filename,
            description,
            user: req.user.id,
            views: 0,
        });
        return res.status(201).json(photo);
    }
    catch (error) {
        return res.status(500).json({ error: 'Erro ao criar post' });
    }
});
exports.createPhoto = createPhoto;
const getPhotos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _page, _total, _user } = req.query;
        const page = parseInt(_page) || 1;
        const total = parseInt(_total) || 6;
        const query = _user && _user !== 'undefined' ? { user: _user } : {};
        const photos = yield Photo_1.default.find(query)
            .skip((page - 1) * total)
            .limit(total);
        res.json(photos);
    }
    catch (error) {
        console.error('Erro ao buscar fotos:', error);
        res.status(500).json({ error: 'Erro interno ao buscar fotos' });
    }
});
exports.getPhotos = getPhotos;
const getPhoto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const photo = yield Photo_1.default.findById(id)
            .populate('user', 'email')
            .populate({
            path: 'comments',
            populate: { path: 'author', select: 'email' },
        });
        if (!photo)
            return res.status(404).json({ error: 'Post não encontrado' });
        photo.views += 1;
        yield photo.save();
        return res.json(photo);
    }
    catch (error) {
        return res.status(500).json({ error: 'Erro ao buscar post' });
    }
});
exports.getPhoto = getPhoto;
const deletePhoto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const photo = yield Photo_1.default.findById(id);
        if (!photo)
            return res.status(404).json({ error: 'Post não encontrado' });
        if (photo.user.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Acesso negado' });
        }
        yield Comment_1.default.deleteMany({ photo: id });
        yield photo.deleteOne();
        return res.json({ message: 'Post deletado' });
    }
    catch (error) {
        return res.status(500).json({ error: 'Erro ao deletar post' });
    }
});
exports.deletePhoto = deletePhoto;
