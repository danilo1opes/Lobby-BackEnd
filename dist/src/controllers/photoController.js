"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePhoto = exports.getPhoto = exports.getPhotos = exports.createPhoto = void 0;
const Photo_1 = __importDefault(require("../models/Photo"));
const Comment_1 = __importDefault(require("../models/Comment"));
const createPhoto = async (req, res) => {
    const { description } = req.body;
    const file = req.file;
    try {
        if (!file)
            return res.status(400).json({ error: 'Imagem não fornecida' });
        const photo = await Photo_1.default.create({
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
};
exports.createPhoto = createPhoto;
const getPhotos = async (req, res) => {
    try {
        const { _page, _total, _user } = req.query;
        const page = parseInt(_page) || 1;
        const total = parseInt(_total) || 6;
        const query = _user && _user !== 'undefined' ? { user: _user } : {};
        const photos = await Photo_1.default.find(query)
            .skip((page - 1) * total)
            .limit(total);
        res.json(photos);
    }
    catch (error) {
        console.error('Erro ao buscar fotos:', error);
        res.status(500).json({ error: 'Erro interno ao buscar fotos' });
    }
};
exports.getPhotos = getPhotos;
const getPhoto = async (req, res) => {
    const { id } = req.params;
    try {
        const photo = await Photo_1.default.findById(id)
            .populate('user', 'email')
            .populate({
            path: 'comments',
            populate: { path: 'author', select: 'email' },
        });
        if (!photo)
            return res.status(404).json({ error: 'Post não encontrado' });
        photo.views += 1;
        await photo.save();
        return res.json(photo);
    }
    catch (error) {
        return res.status(500).json({ error: 'Erro ao buscar post' });
    }
};
exports.getPhoto = getPhoto;
const deletePhoto = async (req, res) => {
    const { id } = req.params;
    try {
        const photo = await Photo_1.default.findById(id);
        if (!photo)
            return res.status(404).json({ error: 'Post não encontrado' });
        if (photo.user.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Acesso negado' });
        }
        await Comment_1.default.deleteMany({ photo: id });
        await photo.deleteOne();
        return res.json({ message: 'Post deletado' });
    }
    catch (error) {
        return res.status(500).json({ error: 'Erro ao deletar post' });
    }
};
exports.deletePhoto = deletePhoto;
