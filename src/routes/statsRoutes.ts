import { Router, Request, Response } from 'express';
import Photo from '../models/Photo';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/stats', authMiddleware, async (req: Request, res: Response) => {
  console.log('Rota /stats foi chamada');
  console.log('Headers:', req.headers);
  console.log('User:', (req as any).user);

  try {
    const user = (req as any).user;

    if (!user || !user.id) {
      console.log('Usuário não autenticado ou sem ID');
      return res.status(401).json({ error: 'Usuário não possui permissão' });
    }

    console.log('Buscando fotos para o usuário:', user.id);
    const photos = await Photo.find({ author: user.id });
    console.log('Fotos encontradas:', photos.length);

    const stats = photos.map((photo) => ({
      id: photo._id,
      title: photo.title,
      acessos: photo.acessos,
    }));

    console.log('Retornando stats:', stats);
    return res.status(200).json(stats);
  } catch (error) {
    console.error('Erro na rota /stats:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

export default router;
