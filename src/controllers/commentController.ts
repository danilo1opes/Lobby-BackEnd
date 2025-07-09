import { Request, Response } from 'express';
import Comment from '../models/Comment';
import Photo from '../models/Photo';

export const createComment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { text } = req.body;
  try {
    const photo = await Photo.findById(id);
    if (!photo) return res.status(404).json({ error: 'Post não encontrado' });
    const comment = await Comment.create({
      text,
      author: req.user!.id,
      photo: id,
    });
    photo.comments.push(comment._id);
    await photo.save();
    const populatedComment = await comment.populate('author', 'email');
    return res.status(201).json(populatedComment);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao criar comentário' });
  }
};
