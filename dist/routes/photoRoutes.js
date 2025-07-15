"use strict";
// import { Router, Request, Response } from 'express';
// import multer from 'multer';
// import Photo from '../models/Photo';
// import Comment from '../models/Comment';
// import User from '../models/User';
// import { authMiddleware } from '../middleware/auth';
// import path from 'path';
// import fs from 'fs';
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
// const router = Router();
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = path.join(__dirname, '../../uploads/');
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
//     cb(null, filename);
//   },
// });
// const fileFilter = (
//   req: Request,
//   file: Express.Multer.File,
//   cb: multer.FileFilterCallback,
// ) => {
//   const allowedTypes = /jpeg|jpg|png/;
//   const extname = allowedTypes.test(
//     path.extname(file.originalname).toLowerCase(),
//   );
//   const mimetype = allowedTypes.test(file.mimetype);
//   if (extname && mimetype) {
//     return cb(null, true);
//   }
//   cb(new Error('Apenas arquivos de imagem (jpeg, jpg, png) são permitidos'));
// };
// const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 8 * 1024 * 1024 },
// }).single('img');
// router.post(
//   '/photo',
//   authMiddleware,
//   (req: Request, res: Response, next) => {
//     upload(req, res, (err) => {
//       if (err) {
//         console.error('Erro no upload:', err.message);
//         return res.status(400).json({ error: err.message });
//       }
//       next();
//     });
//   },
//   async (req: Request, res: Response) => {
//     try {
//       const user = (req as any).user;
//       if (!user || !user.id)
//         return res.status(401).json({ error: 'Usuário não possui permissão' });
//       const { nome, personagem, epoca } = req.body;
//       if (!nome || !personagem || !epoca || !req.file) {
//         console.warn('Dados incompletos:', {
//           nome,
//           personagem,
//           epoca,
//           file: req.file,
//         });
//         return res.status(422).json({ error: 'Dados incompletos' });
//       }
//       const src = `https://lobby-backend-7r4k.onrender.com/uploads/${req.file.filename}`;
//       console.log('Salvando foto com src:', src);
//       const photo = new Photo({
//         title: nome,
//         content: nome,
//         author: user.id,
//         src,
//         personagem,
//         epoca,
//         acessos: 0,
//       });
//       await photo.save();
//       return res.status(201).json({
//         photo: {
//           id: photo._id,
//           author: user.id,
//           title: nome,
//           src,
//           personagem,
//           epoca,
//           acessos: 0,
//         },
//       });
//     } catch (error: any) {
//       console.error('Erro no /photo:', error);
//       return res.status(500).json({ error: 'Erro interno no servidor' });
//     }
//   },
// );
// router.get('/photo/:id', async (req: Request, res: Response) => {
//   try {
//     const photo = await Photo.findById(req.params.id).populate(
//       'author',
//       'username',
//     );
//     if (!photo) return res.status(404).json({ error: 'Post não encontrado' });
//     photo.acessos += 1;
//     await photo.save();
//     const comments = await Comment.find({ post: photo._id }).populate(
//       'author',
//       'username',
//     );
//     const response = {
//       photo: {
//         id: photo._id,
//         author: photo.author ? (photo.author as any).username : 'Unknown',
//         title: photo.title,
//         date: photo.createdAt,
//         src:
//           photo.src ||
//           'https://lobby-backend-7r4k.onrender.com/uploads/placeholder.jpg',
//         personagem: photo.personagem,
//         epoca: photo.epoca,
//         acessos: photo.acessos,
//         total_comments: comments.length,
//       },
//       comments: comments.map((comment) => ({
//         comment_ID: comment._id,
//         comment_post_ID: comment.post,
//         comment_author: (comment.author as any)
//           ? (comment.author as any).username
//           : 'Unknown',
//         comment_content: comment.content,
//         comment_date: comment.createdAt,
//       })),
//     };
//     console.log('GET /photo/:id - Resposta:', response);
//     return res.status(200).json(response);
//   } catch (error) {
//     console.error('Erro no GET /photo/:id:', error);
//     return res.status(500).json({ error: 'Erro interno no servidor' });
//   }
// });
// router.get('/photo', async (req: Request, res: Response) => {
//   try {
//     const _total = parseInt(req.query._total as string) || 6;
//     const _page = parseInt(req.query._page as string) || 1;
//     const _user = req.query._user as string;
//     let authorId: any = null;
//     if (_user) {
//       const user = await User.findOne({ username: _user });
//       if (user) authorId = user._id;
//     }
//     const query: any = {};
//     if (authorId) query.author = authorId;
//     const photos = await Photo.find(query)
//       .populate('author', 'username')
//       .skip((_page - 1) * _total)
//       .limit(_total);
//     const response = await Promise.all(
//       photos.map(async (photo) => ({
//         id: photo._id,
//         author: photo.author ? (photo.author as any).username : 'Unknown',
//         title: photo.title,
//         date: photo.createdAt,
//         src:
//           photo.src ||
//           'https://lobby-backend-7r4k.onrender.com/uploads/placeholder.jpg',
//         personagem: photo.personagem,
//         epoca: photo.epoca,
//         acessos: photo.acessos,
//         total_comments: await Comment.countDocuments({ post: photo._id }),
//       })),
//     );
//     console.log('GET /photo - Resposta:', response);
//     return res.status(200).json(response);
//   } catch (error) {
//     console.error('Erro no GET /photo:', error);
//     return res.status(500).json({ error: 'Erro interno no servidor' });
//   }
// });
// router.delete(
//   '/photo/:id',
//   authMiddleware,
//   async (req: Request, res: Response) => {
//     try {
//       const user = (req as any).user;
//       const photo = await Photo.findById(req.params.id);
//       if (!photo || photo.author.toString() !== user.id)
//         return res.status(401).json({ error: 'Sem permissão' });
//       await Photo.deleteOne({ _id: req.params.id });
//       await Comment.deleteMany({ post: req.params.id });
//       if (
//         photo.src &&
//         fs.existsSync(
//           path.join(__dirname, '../../uploads/', path.basename(photo.src)),
//         )
//       ) {
//         fs.unlinkSync(
//           path.join(__dirname, '../../uploads/', path.basename(photo.src)),
//         );
//       }
//       return res.status(200).json('Post deletado');
//     } catch (error) {
//       return res.status(500).json({ error: 'Erro interno no servidor' });
//     }
//   },
// );
// export default router;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const Photo_1 = __importDefault(require("../models/Photo"));
const Comment_1 = __importDefault(require("../models/Comment"));
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
// Configuração do AWS S3
const s3 = new aws_sdk_1.default.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    signatureVersion: 'v4',
});
// Configuração do multer para S3
const upload = (0, multer_1.default)({
    storage: (0, multer_s3_1.default)({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME || 'lobby-uploads',
        contentType: multer_s3_1.default.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
            cb(null, filename);
        },
    }),
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Apenas arquivos de imagem (jpeg, jpg, png) são permitidos'));
    },
    limits: { fileSize: 8 * 1024 * 1024 },
}).single('img');
router.post('/photo', auth_1.authMiddleware, (req, res, next) => {
    upload(req, res, (err) => {
        if (err) {
            console.error('Erro no upload:', err.message);
            return res.status(400).json({ error: err.message });
        }
        next();
    });
}, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user || !user.id)
            return res.status(401).json({ error: 'Usuário não possui permissão' });
        const { nome, personagem, epoca } = req.body;
        if (!nome || !personagem || !epoca || !req.file) {
            console.warn('Dados incompletos:', {
                nome,
                personagem,
                epoca,
                file: req.file,
            });
            return res.status(422).json({ error: 'Dados incompletos' });
        }
        const src = req.file.location;
        console.log('Salvando foto com src:', src);
        const photo = new Photo_1.default({
            title: nome,
            content: nome,
            author: user.id,
            src,
            personagem,
            epoca,
            acessos: 0,
        });
        yield photo.save();
        return res.status(201).json({
            photo: {
                id: photo._id,
                author: user.id,
                title: nome,
                src,
                personagem,
                epoca,
                acessos: 0,
            },
        });
    }
    catch (error) {
        console.error('Erro no /photo:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
}));
router.get('/photo/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const photo = yield Photo_1.default.findById(req.params.id).populate('author', 'username');
        if (!photo)
            return res.status(404).json({ error: 'Post não encontrado' });
        photo.acessos += 1;
        yield photo.save();
        const comments = yield Comment_1.default.find({ post: photo._id }).populate('author', 'username');
        const response = {
            photo: {
                id: photo._id,
                author: photo.author ? photo.author.username : 'Unknown',
                title: photo.title,
                date: photo.createdAt,
                src: photo.src ||
                    `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/placeholder.jpg`,
                personagem: photo.personagem,
                epoca: photo.epoca,
                acessos: photo.acessos,
                total_comments: comments.length,
            },
            comments: comments.map((comment) => ({
                comment_ID: comment._id,
                comment_post_ID: comment.post,
                comment_author: comment.author
                    ? comment.author.username
                    : 'Unknown',
                comment_content: comment.content,
                comment_date: comment.createdAt,
            })),
        };
        console.log('GET /photo/:id - Resposta:', response);
        return res.status(200).json(response);
    }
    catch (error) {
        console.error('Erro no GET /photo/:id:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
}));
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
                src: photo.src ||
                    `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/placeholder.jpg`,
                personagem: photo.personagem,
                epoca: photo.epoca,
                acessos: photo.acessos,
                total_comments: yield Comment_1.default.countDocuments({ post: photo._id }),
            });
        })));
        console.log('GET /photo - Resposta:', response);
        return res.status(200).json(response);
    }
    catch (error) {
        console.error('Erro no GET /photo:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
}));
router.delete('/photo/:id', auth_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const photo = yield Photo_1.default.findById(req.params.id);
        if (!photo || photo.author.toString() !== user.id)
            return res.status(401).json({ error: 'Sem permissão' });
        if (photo.src) {
            try {
                const url = new URL(photo.src);
                const key = url.pathname.substring(1);
                yield s3
                    .deleteObject({
                    Bucket: process.env.AWS_BUCKET_NAME || 'lobby-uploads',
                    Key: key,
                })
                    .promise();
                console.log('Imagem deletada do S3:', key);
            }
            catch (s3Error) {
                console.error('Erro ao deletar do S3:', s3Error);
            }
        }
        yield Photo_1.default.deleteOne({ _id: req.params.id });
        yield Comment_1.default.deleteMany({ post: req.params.id });
        return res.status(200).json('Post deletado');
    }
    catch (error) {
        console.error('Erro no DELETE /photo/:id:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
}));
exports.default = router;
