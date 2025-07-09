import { Router, Request, Response } from 'express';
import multer from 'multer';
import Photo, { IPhoto } from '../models/Photo';
import Comment, { IComment } from '../models/Comment';
import User, { IUser } from '../models/User';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// POST /json/photo - Create a new photo post
router.post(
  '/photo',
  authMiddleware,
  upload.single('img'),
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user || !user.id) {
        return res.status(401).json({ error: 'Usuário não possui permissão' });
      }

      const { nome, peso, idade } = req.body;
      if (!nome || !peso || !idade || !req.file) {
        return res.status(422).json({ error: 'Dados incompletos' });
      }

      const photo = new Photo({
        title: nome,
        content: nome,
        author: user.id,
        imageUrl: `/uploads/${req.file.filename}`, // Adjust based on storage solution
        peso,
        idade,
        acessos: 0,
      });

      await photo.save();

      return res.status(201).json({
        post_author: user.id,
        post_type: 'photo',
        post_status: 'publish',
        post_title: nome,
        post_content: nome,
        files: req.file,
        meta_input: { peso, idade, acessos: 0 },
      });
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno no servidor' });
    }
  }
);

// GET /json/photo/:id - Fetch a single photo with comments
router.get('/photo/:id', async (req: Request, res: Response) => {
  try {
    const photo = await Photo.findById(req.params.id).populate<{
      author: IUser;
    }>('author', 'username');
    if (!photo) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }

    photo.acessos += 1;
    await photo.save();

    const comments = await Comment.find({ post: photo._id }).populate<{
      author: IUser;
    }>('author', 'username');

    const response = {
      photo: {
        id: photo._id,
        author: photo.author ? photo.author.username : 'Unknown',
        title: photo.title,
        date: photo.createdAt,
        src: photo.imageUrl,
        peso: photo.peso,
        idade: photo.idade,
        acessos: photo.acessos,
        total_comments: comments.length,
      },
      comments: comments.map((comment) => ({
        comment_ID: comment._id,
        comment_post_ID: comment.post,
        comment_author: comment.author ? comment.author.username : 'Unknown',
        comment_content: comment.content,
        comment_date: comment.createdAt,
      })),
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// GET /json/photo - Fetch photos with pagination and optional user filter
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
      .populate<{ author: IUser }>('author', 'username')
      .skip((_page - 1) * _total)
      .limit(_total);

    const response = await Promise.all(
      photos.map(async (photo) => ({
        id: photo._id,
        author: photo.author ? photo.author.username : 'Unknown',
        title: photo.title,
        date: photo.createdAt,
        src: photo.imageUrl,
        peso: photo.peso,
        idade: photo.idade,
        acessos: photo.acessos,
        total_comments: await Comment.countDocuments({ post: photo._id }),
      }))
    );

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// DELETE /json/photo/:id - Delete a photo post
router.delete(
  '/photo/:id',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const photo = await Photo.findById(req.params.id);

      if (!photo || photo.author.toString() !== user.id) {
        return res.status(401).json({ error: 'Sem permissão' });
      }

      await Photo.deleteOne({ _id: req.params.id });
      await Comment.deleteMany({ post: req.params.id });

      return res.status(200).json('Post deletado');
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno no servidor' });
    }
  }
);

export default router;
