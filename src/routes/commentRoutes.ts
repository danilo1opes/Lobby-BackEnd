import { Router, Request, Response } from 'express';
import Comment, { IComment } from '../models/Comment';
import User, { IUser } from '../models/User';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post(
  '/comment/:id',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user || !user.id) {
        return res.status(401).json({ error: 'Sem permissão' });
      }

      const { comment } = req.body;
      if (!comment) {
        return res.status(422).json({ error: 'Dados incompletos' });
      }

      const newComment = new Comment({
        content: comment,
        author: user.id,
        post: req.params.id,
      });

      await newComment.save();

      const populatedComment = await Comment.findById(newComment._id).populate<{
        author: IUser;
      }>('author', 'username');

      if (!populatedComment) {
        return res.status(500).json({ error: 'Erro ao recuperar comentário' });
      }

      return res.status(201).json({
        comment_ID: populatedComment._id,
        comment_post_ID: populatedComment.post,
        comment_author: populatedComment.author
          ? populatedComment.author.username
          : 'Unknown',
        comment_content: populatedComment.content,
        comment_date: populatedComment.createdAt,
      });
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno no servidor' });
    }
  }
);

router.get('/comment/:id', async (req: Request, res: Response) => {
  try {
    const comments = await Comment.find({ post: req.params.id }).populate<{
      author: IUser;
    }>('author', 'username');

    const response = comments.map((comment) => ({
      comment_ID: comment._id,
      comment_post_ID: comment.post,
      comment_author: comment.author
        ? (comment.author as IUser).username
        : 'Unknown',
      comment_content: comment.content,
      comment_date: comment.createdAt,
    }));

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

export default router;
