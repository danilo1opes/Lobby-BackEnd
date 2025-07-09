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
exports.createComment = void 0;
const Comment_1 = __importDefault(require("../models/Comment"));
const Photo_1 = __importDefault(require("../models/Photo"));
const createComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { text } = req.body;
    try {
        const photo = yield Photo_1.default.findById(id);
        if (!photo)
            return res.status(404).json({ error: 'Post não encontrado' });
        const comment = yield Comment_1.default.create({
            text,
            author: req.user.id,
            photo: id,
        });
        photo.comments.push(comment._id);
        yield photo.save();
        const populatedComment = yield comment.populate('author', 'email');
        return res.status(201).json(populatedComment);
    }
    catch (error) {
        return res.status(500).json({ error: 'Erro ao criar comentário' });
    }
});
exports.createComment = createComment;
