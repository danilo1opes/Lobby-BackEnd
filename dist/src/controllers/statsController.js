"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = void 0;
const Photo_1 = __importDefault(require("../models/Photo"));
const Comment_1 = __importDefault(require("../models/Comment"));
const getStats = async (req, res) => {
    try {
        const totalPhotos = await Photo_1.default.countDocuments();
        const totalComments = await Comment_1.default.countDocuments();
        const totalViews = await Photo_1.default.aggregate([
            { $group: { _id: null, views: { $sum: '$views' } } },
        ]);
        return res.json({
            photos: totalPhotos,
            comments: totalComments,
            views: totalViews[0]?.views || 0,
        });
    }
    catch (error) {
        return res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
};
exports.getStats = getStats;
