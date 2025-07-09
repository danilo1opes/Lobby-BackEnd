import { Request, Response } from 'express';
import Photo from '../models/Photo';
import Comment from '../models/Comment';

export const getStats = async (req: Request, res: Response) => {
  try {
    const totalPhotos = await Photo.countDocuments();
    const totalComments = await Comment.countDocuments();
    const totalViews = await Photo.aggregate([
      { $group: { _id: null, views: { $sum: '$views' } } },
    ]);
    return res.json({
      photos: totalPhotos,
      comments: totalComments,
      views: totalViews[0]?.views || 0,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
};