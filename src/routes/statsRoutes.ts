import { Router, Request, Response } from 'express';
import Photo from '../models/Photo';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Rota principal de estatísticas
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user || !user.id) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const photos = await Photo.find({ author: user.id });

    if (photos.length === 0) {
      return res.status(200).json([]);
    }

    const stats = photos.map((photo) => ({
      id: photo._id,
      title: photo.title,
      acessos: photo.acessos || 0,
    }));

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Erro na rota stats:', error);
    return res.status(500).json({
      error: 'Erro interno no servidor',
    });
  }
});

export default router;
