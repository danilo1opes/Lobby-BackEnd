import { Router, Request, Response } from 'express';
import Photo from '../models/Photo';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.id) {
      return res.status(401).json({ error: 'Usuário não possui permissão' });
    }

    const photos = await Photo.find({ author: user.id });

    const stats = photos.map((photo) => ({
      id: photo._id,
      title: photo.title,
      acessos: photo.acessos,
    }));

    return res.status(200).json(stats);
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

export default router;
