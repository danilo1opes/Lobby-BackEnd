import { Router, Request, Response } from 'express';
import Photo from '../models/Photo';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Rota de teste sem autenticação
router.get('/test', (req: Request, res: Response) => {
  console.log('Rota de teste stats chamada');
  res.json({ message: 'Stats route is working' });
});

// Rota principal com logs detalhados
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  console.log('=== INICIANDO ROTA STATS ===');
  console.log('Headers:', req.headers);
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('URL:', req.url);

  try {
    const user = (req as any).user;
    console.log('User from token:', user);

    if (!user || !user.id) {
      console.log('Erro: Usuário não autenticado');
      return res.status(401).json({ error: 'Usuário não possui permissão' });
    }

    console.log('Buscando fotos para usuário:', user.id);
    const photos = await Photo.find({ author: user.id });
    console.log('Fotos encontradas:', photos.length);

    // Retorno simples para teste
    const stats = photos.map((photo) => ({
      id: photo._id,
      title: photo.title,
      acessos: photo.acessos || 0,
    }));

    console.log('Retornando stats:', stats);
    console.log('=== FIM ROTA STATS ===');

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Erro na rota stats:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

export default router;
