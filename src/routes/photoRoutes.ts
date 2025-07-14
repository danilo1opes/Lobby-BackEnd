// import { Router, Request, Response } from 'express';
// import multer from 'multer';
// import Photo from '../models/Photo';
// import Comment from '../models/Comment';
// import User from '../models/User';
// import { authMiddleware } from '../middleware/auth';
// import path from 'path';
// import fs from 'fs';

// const router = Router();

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = 'uploads/';
//     if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`; // Remove espaços
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
//   limits: { fileSize: 5 * 1024 * 1024 },
// }).single('img');

// router.post(
//   '/photo',
//   authMiddleware,
//   (req: Request, res: Response, next) => {
//     upload(req, res, (err) => {
//       if (err) return res.status(400).json({ error: err.message });
//       next();
//     });
//   },
//   async (req: Request, res: Response) => {
//     try {
//       const user = (req as any).user;
//       if (!user || !user.id)
//         return res.status(401).json({ error: 'Usuário não possui permissão' });

//       const { nome, peso, idade } = req.body;
//       if (!nome || !peso || !idade || !req.file)
//         return res.status(422).json({ error: 'Dados incompletos' });

//       const src = `https://lobby-backend-7r4k.onrender.com/uploads/${req.file.filename}`; // URL absoluta
//       const photo = new Photo({
//         title: nome,
//         content: nome,
//         author: user.id,
//         src,
//         peso,
//         idade,
//         acessos: 0,
//       });

//       await photo.save();
//       return res.status(201).json({
//         photo: {
//           id: photo._id,
//           author: user.id,
//           title: nome,
//           src,
//           peso,
//           idade,
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
//         src: photo.src, // URL absoluta
//         peso: photo.peso,
//         idade: photo.idade,
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
//         src: photo.src, // URL absoluta
//         peso: photo.peso,
//         idade: photo.idade,
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
//           `.${photo.src.replace(
//             'https://lobby-backend-7r4k.onrender.com',
//             '',
//           )}`,
//         )
//       ) {
//         fs.unlinkSync(
//           `.${photo.src.replace(
//             'https://lobby-backend-7r4k.onrender.com',
//             '',
//           )}`,
//         );
//       }

//       return res.status(200).json('Post deletado');
//     } catch (error) {
//       return res.status(500).json({ error: 'Erro interno no servidor' });
//     }
//   },
// );

// export default router;

import { Router, Request, Response } from 'express';
import multer from 'multer';
import Photo from '../models/Photo';
import Comment from '../models/Comment';
import User from '../models/User';
import { authMiddleware } from '../middleware/auth';
import path from 'path';
import fs from 'fs';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`; // Remove espaços
    cb(null, filename);
  },
});

const fileFilter = (
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
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('img');

router.post(
  '/photo',
  authMiddleware,
  (req: Request, res: Response, next) => {
    upload(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message });
      next();
    });
  },
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user || !user.id)
        return res.status(401).json({ error: 'Usuário não possui permissão' });

      const { nome, personagem, epoca } = req.body; // Atualizado para 'personagem' e 'epoca'
      if (!nome || !personagem || !epoca || !req.file)
        return res.status(422).json({ error: 'Dados incompletos' });

      const src = `https://lobby-backend-7r4k.onrender.com/uploads/${req.file.filename}`; // URL absoluta
      const photo = new Photo({
        title: nome,
        content: nome,
        author: user.id,
        src,
        personagem, // Usa diretamente 'personagem'
        epoca, // Usa diretamente 'epoca'
        acessos: 0,
      });

      await photo.save();
      return res.status(201).json({
        photo: {
          id: photo._id,
          author: user.id,
          title: nome,
          src,
          personagem, // Retorna 'personagem'
          epoca, // Retorna 'epoca'
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
        src: photo.src, // URL absoluta
        personagem: photo.personagem, // Atualizado para 'personagem'
        epoca: photo.epoca, // Atualizado para 'epoca'
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
        src: photo.src, // URL absoluta
        personagem: photo.personagem, // Atualizado para 'personagem'
        epoca: photo.epoca, // Atualizado para 'epoca'
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

      await Photo.deleteOne({ _id: req.params.id });
      await Comment.deleteMany({ post: req.params.id });

      if (
        photo.src &&
        fs.existsSync(
          `.${photo.src.replace(
            'https://lobby-backend-7r4k.onrender.com',
            '',
          )}`,
        )
      ) {
        fs.unlinkSync(
          `.${photo.src.replace(
            'https://lobby-backend-7r4k.onrender.com',
            '',
          )}`,
        );
      }

      return res.status(200).json('Post deletado');
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno no servidor' });
    }
  },
);

export default router;
