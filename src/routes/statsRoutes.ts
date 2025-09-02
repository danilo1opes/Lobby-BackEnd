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

    const photos = await Photo.find({ author: user.id }).sort({
      createdAt: -1,
    });

    // Total de acessos
    const totalAccessos = photos.reduce(
      (sum, photo) => sum + (photo.acessos || 0),
      0,
    );

    // Fotos postadas
    const fotosPostadas = photos.length;

    // Média de acessos
    const mediaAcessos =
      fotosPostadas > 0 ? Math.round(totalAccessos / fotosPostadas) : 0;

    // Foto mais acessada
    const fotoMaisAcessada = photos.reduce((max, photo) => {
      return (photo.acessos || 0) > (max.acessos || 0) ? photo : max;
    }, photos[0] || null);

    // Ranking das 6 fotos mais acessadas
    const rankingFotos = photos
      .sort((a, b) => (b.acessos || 0) - (a.acessos || 0))
      .slice(0, 6)
      .map((photo) => ({
        id: photo._id,
        title: photo.title,
        acessos: photo.acessos || 0,
        src: photo.src,
        author: photo.author,
      }));

    // Tendência de performance (últimos 6 meses ou fotos mais recentes)
    const tendenciaPerformance = photos
      .slice(0, 6)
      .reverse()
      .map((photo) => ({
        name:
          photo.title.length > 15
            ? photo.title.substring(0, 15) + '...'
            : photo.title,
        acessos: photo.acessos || 0,
      }));

    const stats = {
      totalAccessos,
      fotosPostadas,
      mediaAcessos,
      fotoMaisAcessada: fotoMaisAcessada
        ? {
            id: fotoMaisAcessada._id,
            title: fotoMaisAcessada.title,
            acessos: fotoMaisAcessada.acessos || 0,
            src: fotoMaisAcessada.src,
            author: fotoMaisAcessada.author,
          }
        : {
            id: '',
            title: 'Nenhuma foto',
            acessos: 0,
            src: '',
            author: '',
          },
      rankingFotos,
      tendenciaPerformance,
    };

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

export default router;
