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

    const basicStats = photos.map((photo) => ({
      id: photo._id,
      title: photo.title,
      acessos: photo.acessos || 0,
    }));

    const totalPhotos = photos.length;
    const totalAcessos = photos.reduce(
      (sum, photo) => sum + (photo.acessos || 0),
      0,
    );
    const averageAcessos =
      totalPhotos > 0 ? Math.round(totalAcessos / totalPhotos) : 0;

    const topPhotos = [...photos]
      .sort((a, b) => (b.acessos || 0) - (a.acessos || 0))
      .slice(0, 5)
      .map((photo) => ({
        title: photo.title,
        acessos: photo.acessos || 0,
      }));

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        day: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
        acessos: Math.floor(Math.random() * 50) + 10,
      };
    }).reverse();

    const response = {
      photos: basicStats,

      summary: {
        totalPhotos,
        totalAcessos,
        averageAcessos,
      },

      topPhotos,
      weeklyStats: last7Days,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Erro na rota /stats:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

export default router;
