"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Photo_1 = __importDefault(require("../models/Photo"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/stats', auth_1.authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        if (!user || !user.id) {
            return res.status(401).json({ error: 'Usuário não possui permissão' });
        }
        console.log('Usuário autenticado:', user.id); // Log para depuração
        const photos = await Photo_1.default.find({ author: user.id });
        const stats = photos.map((photo) => ({
            id: photo._id,
            title: photo.title,
            acessos: photo.acessos,
        }));
        return res.status(200).json(stats);
    }
    catch (error) {
        console.error('Erro em /stats:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
});
exports.default = router;
