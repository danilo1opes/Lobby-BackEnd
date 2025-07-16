"use strict";
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
const path_1 = __importDefault(require("path"));
const client_s3_1 = require("@aws-sdk/client-s3");
const router = (0, express_1.Router)();
// Configuração do S3 Client (SDK v3)
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION || 'us-east-2',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});
const BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'nyxlobby-uploads';
const storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
        return cb(null, true);
    }
    cb(new Error('Apenas arquivos de imagem são permitidos'));
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
}).single('img');
async function uploadToS3(file) {
    const key = `uploads/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    const command = new client_s3_1.PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
    });
    try {
        await s3Client.send(command);
        return `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
    }
    catch (error) {
        console.error('Erro no upload S3:', JSON.stringify(error, null, 2));
        throw new Error('Falha no upload da imagem');
    }
}
async function deleteFromS3(url) {
    try {
        const key = url.split('.com/')[1];
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });
        await s3Client.send(command);
    }
    catch (error) {
        console.error('Erro ao deletar do S3:', error);
    }
}
router.get('/test-config', (req, res) => {
    res.json({
        awsConfigured: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
        bucketName: BUCKET_NAME,
        region: process.env.AWS_REGION || 'us-east-1',
        hasCredentials: {
            accessKeyId: !!process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: !!process.env.AWS_SECRET_ACCESS_KEY,
        },
    });
});
router.post('/photo', auth_1.authMiddleware, (req, res, next) => {
    upload(req, res, (err) => {
        if (err) {
            console.error('Erro no upload:', err.message);
            return res.status(400).json({ error: err.message });
        }
        next();
    });
}, async (req, res) => {
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
                file: !!req.file,
            });
            return res.status(422).json({ error: 'Dados incompletos' });
        }
        if (!process.env.AWS_ACCESS_KEY_ID ||
            !process.env.AWS_SECRET_ACCESS_KEY) {
            console.error('Credenciais AWS não configuradas');
            return res
                .status(500)
                .json({ error: 'Configuração do servidor incompleta' });
        }
        const src = await uploadToS3(req.file);
        console.log('Upload S3 realizado com sucesso:', src);
        const photo = new Photo_1.default({
            title: nome,
            content: nome,
            author: user.id,
            src,
            personagem,
            epoca,
            acessos: 0,
        });
        await photo.save();
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
        return res
            .status(500)
            .json({ error: error.message || 'Erro interno no servidor' });
    }
});
router.get('/photo/:id', async (req, res) => {
    try {
        const photo = await Photo_1.default.findById(req.params.id).populate('author', 'username');
        if (!photo)
            return res.status(404).json({ error: 'Post não encontrado' });
        photo.acessos += 1;
        await photo.save();
        const comments = await Comment_1.default.find({ post: photo._id }).populate('author', 'username');
        const response = {
            photo: {
                id: photo._id,
                author: photo.author ? photo.author.username : 'Unknown',
                title: photo.title,
                date: photo.createdAt,
                src: photo.src,
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
        return res.status(200).json(response);
    }
    catch (error) {
        console.error('Erro no GET /photo/:id:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
});
router.get('/photo', async (req, res) => {
    try {
        const _total = parseInt(req.query._total) || 6;
        const _page = parseInt(req.query._page) || 1;
        const _user = req.query._user;
        let authorId = null;
        if (_user) {
            const user = await User_1.default.findOne({ username: _user });
            if (user)
                authorId = user._id;
        }
        const query = {};
        if (authorId)
            query.author = authorId;
        const photos = await Photo_1.default.find(query)
            .populate('author', 'username')
            .skip((_page - 1) * _total)
            .limit(_total);
        const response = await Promise.all(photos.map(async (photo) => ({
            id: photo._id,
            author: photo.author ? photo.author.username : 'Unknown',
            title: photo.title,
            date: photo.createdAt,
            src: photo.src,
            personagem: photo.personagem,
            epoca: photo.epoca,
            acessos: photo.acessos,
            total_comments: await Comment_1.default.countDocuments({ post: photo._id }),
        })));
        return res.status(200).json(response);
    }
    catch (error) {
        console.error('Erro no GET /photo:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
});
router.delete('/photo/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const photo = await Photo_1.default.findById(req.params.id);
        if (!photo || photo.author.toString() !== user.id)
            return res.status(401).json({ error: 'Sem permissão' });
        if (photo.src && photo.src.includes('amazonaws.com')) {
            await deleteFromS3(photo.src);
            console.log('Arquivo deletado do S3:', photo.src);
        }
        await Photo_1.default.deleteOne({ _id: req.params.id });
        await Comment_1.default.deleteMany({ post: req.params.id });
        return res
            .status(200)
            .json({ message: 'Post deletado', redirect: '/photo' });
    }
    catch (error) {
        console.error('Erro no DELETE /photo/:id:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
});
exports.default = router;
