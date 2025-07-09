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
exports.getStats = void 0;
const Photo_1 = __importDefault(require("../models/Photo"));
const Comment_1 = __importDefault(require("../models/Comment"));
const getStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const totalPhotos = yield Photo_1.default.countDocuments();
        const totalComments = yield Comment_1.default.countDocuments();
        const totalViews = yield Photo_1.default.aggregate([
            { $group: { _id: null, views: { $sum: '$views' } } },
        ]);
        return res.json({
            photos: totalPhotos,
            comments: totalComments,
            views: ((_a = totalViews[0]) === null || _a === void 0 ? void 0 : _a.views) || 0,
        });
    }
    catch (error) {
        return res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
});
exports.getStats = getStats;
