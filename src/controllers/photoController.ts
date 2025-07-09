import { Request, Response } from 'express';
import Photo from '../models/Photo';
import Comment from '../models/Comment';

export const createPhoto = async (req: Request, res: Response) => {
  const { description } = req.body;
  const file = req.file;
  try {
    if (!file) return res.status(400).json({ error: 'Imagem não fornecida' });
    const photo = await Photo.create({
      image: file.filename,
      description,
      user: req.user!.id,
      views: 0,
    });
    return res.status(201).json(photo);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao criar post' });
  }
};

export const getPhotos = async (req: Request, res: Response) => {
  const { _page = 1, _total = 10, _user } = req.query;
  const page = parseInt(_page as string);
  const total = parseInt(_total as string);
  try {
    const query = _user ? { user: _user } : {};
    const photos = await Photo.find(query)
      .skip((page - 1) * total)
      .limit(total)
      .populate('user', 'email');
    return res.json(photos);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar posts' });
  }
};

export const getPhoto = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const photo = await Photo.findById(id)
      .populate('user', 'email')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'email' },
      });
    if (!photo) return res.status(404).json({ error: 'Post não encontrado' });
    photo.views += 1;
    await photo.save();
    return res.json(photo);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar post' });
  }
};

export const deletePhoto = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const photo = await Photo.findById(id);
    if (!photo) return res.status(404).json({ error: 'Post não encontrado' });
    if (photo.user.toString() !== req.user!.id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    await Comment.deleteMany({ photo: id });
    await photo.deleteOne();
    return res.json({ message: 'Post deletado' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao deletar post' });
  }
};
