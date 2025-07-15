import { Router, Request, Response } from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import AWS from 'aws-sdk';
import Photo from '../models/Photo';
import Comment from '../models/Comment';
import User from '../models/User';
import { authMiddleware } from '../middleware/auth';
import path from 'path';

const router = Router();

// Configuração do AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-2',
  signatureVersion: 'v4',
});

// Configuração do multer para S3
const upload = multer({
  storage: multerS3({
    s3: s3 as any,
    bucket: process.env.AWS_BUCKET_NAME || 'lobby-uploads',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const filename = `${Date.now()}-${file.originalname.replace(
        /\s+/g,
        '-',
      )}`;
      cb(null, filename);
    },
  }),
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
  ) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Apenas arquivos de imagem (jpeg, jpg, png) são permitidos'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('img');

router.post(
  '/photo',
  authMiddleware,
  (req: Request, res: Response, next) => {
    upload(req, res, (err) => {
      if (err) {
        console.error('Erro no upload:', err.message);
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
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

      const src = (req.file as any).location;
      console.log('Salvando foto com src:', src);

      const photo = new Photo({
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
    } catch (error: any) {
      console.error('Erro no /photo:', error);
      return res.status(500).json({ error: 'Erro interno no servidor' });
    }
  },
);

router.get('/photo/:id', async (req: Request, res: Response) => {
  try {
    const photo = await Photo.findById(req.params.id).populate(
      'author',
      'username',
    );
    if (!photo) return res.status(404).json({ error: 'Post não encontrado' });

    photo.acessos += 1;
    await photo.save();

    const comments = await Comment.find({ post: photo._id }).populate(
      'author',
      'username',
    );

    const response = {
      photo: {
        id: photo._id,
        author: photo.author ? (photo.author as any).username : 'Unknown',
        title: photo.title,
        date: photo.createdAt,
        src:
          photo.src ||
          `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/placeholder.jpg`,
        personagem: photo.personagem,
        epoca: photo.epoca,
        acessos: photo.acessos,
        total_comments: comments.length,
      },
      comments: comments.map((comment) => ({
        comment_ID: comment._id,
        comment_post_ID: comment.post,
        comment_author: (comment.author as any)
          ? (comment.author as any).username
          : 'Unknown',
        comment_content: comment.content,
        comment_date: comment.createdAt,
      })),
    };

    console.log('GET /photo/:id - Resposta:', response);
    return res.status(200).json(response);
  } catch (error) {
    console.error('Erro no GET /photo/:id:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

router.get('/photo', async (req: Request, res: Response) => {
  try {
    const _total = parseInt(req.query._total as string) || 6;
    const _page = parseInt(req.query._page as string) || 1;
    const _user = req.query._user as string;

    let authorId: any = null;
    if (_user) {
      const user = await User.findOne({ username: _user });
      if (user) authorId = user._id;
    }

    const query: any = {};
    if (authorId) query.author = authorId;

    const photos = await Photo.find(query)
      .populate('author', 'username')
      .skip((_page - 1) * _total)
      .limit(_total);

    const response = await Promise.all(
      photos.map(async (photo) => ({
        id: photo._id,
        author: photo.author ? (photo.author as any).username : 'Unknown',
        title: photo.title,
        date: photo.createdAt,
        src:
          photo.src ||
          `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/placeholder.jpg`,
        personagem: photo.personagem,
        epoca: photo.epoca,
        acessos: photo.acessos,
        total_comments: await Comment.countDocuments({ post: photo._id }),
      })),
    );

    console.log('GET /photo - Resposta:', response);
    return res.status(200).json(response);
  } catch (error) {
    console.error('Erro no GET /photo:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

router.delete(
  '/photo/:id',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const photo = await Photo.findById(req.params.id);

      if (!photo || photo.author.toString() !== user.id)
        return res.status(401).json({ error: 'Sem permissão' });

      if (photo.src) {
        try {
          const url = new URL(photo.src);
          const key = url.pathname.substring(1);

          await s3
            .deleteObject({
              Bucket: process.env.AWS_BUCKET_NAME || 'lobby-uploads',
              Key: key,
            })
            .promise();
        } catch (s3Error) {
          console.error('Erro ao deletar do S3:', s3Error);
        }
      }

      await Photo.deleteOne({ _id: req.params.id });
      await Comment.deleteMany({ post: req.params.id });

      return res.status(200).json('Post deletado');
    } catch (error) {
      console.error('Erro no DELETE /photo/:id:', error);
      return res.status(500).json({ error: 'Erro interno no servidor' });
    }
  },
);

export default router;
