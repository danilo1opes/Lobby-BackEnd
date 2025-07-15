import { Router, Request, Response } from 'express';
import Photo from '../models/Photo';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Rota de teste sem autenticação
router.get('/test', (req: Request, res: Response) => {
  console.log('Rota de teste stats chamada');
  res.json({ message: 'Stats route is working' });
});

// Rota para testar se consegue acessar o banco
router.get('/debug', async (req: Request, res: Response) => {
  try {
    console.log('=== TESTE DEBUG ===');
    const photos = await Photo.find({}).limit(5);
    console.log('Fotos encontradas no debug:', photos.length);

    res.json({
      message: 'Debug route working',
      photoCount: photos.length,
      photos: photos.map((p) => ({
        id: p._id,
        title: p.title,
        acessos: p.acessos || 0,
        author: p.author,
      })),
    });
  } catch (error) {
    console.error('Erro na rota stats:', error);
    const err = error as Error;
    return res.status(500).json({
      error: 'Erro interno no servidor',
      details: err.message,
    });
  }
});

// Rota para testar autenticação
router.get('/auth-test', authMiddleware, (req: Request, res: Response) => {
  console.log('=== TESTE AUTENTICAÇÃO ===');
  const user = (req as any).user;
  console.log('User from token:', user);

  res.json({
    message: 'Auth test working',
    user: user,
    hasId: !!user?.id,
  });
});

// Rota principal com logs detalhados
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  console.log('=== INICIANDO ROTA STATS ===');
  console.log('Headers Authorization:', req.headers.authorization);
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('URL:', req.url);

  try {
    const user = (req as any).user;
    console.log('User from token:', JSON.stringify(user, null, 2));

    if (!user) {
      console.log('Erro: Usuário não encontrado no token');
      return res.status(401).json({ error: 'Token inválido' });
    }

    if (!user.id) {
      console.log('Erro: User ID não encontrado');
      console.log('User object:', user);
      return res
        .status(401)
        .json({ error: 'ID do usuário não encontrado no token' });
    }

    console.log('Buscando fotos para usuário:', user.id);
    const photos = await Photo.find({ author: user.id });
    console.log('Fotos encontradas:', photos.length);

    if (photos.length === 0) {
      console.log('Nenhuma foto encontrada para o usuário');
      return res.status(200).json([]);
    }

    // Retorno simples para teste
    const stats = photos.map((photo) => ({
      id: photo._id,
      title: photo.title,
      acessos: photo.acessos || 0,
    }));

    console.log('Stats processadas:', stats.length);
    console.log('Primeira stat:', stats[0]);
    console.log('=== FIM ROTA STATS ===');

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Erro na rota stats:', error);

    let message = 'Erro desconhecido';
    if (error instanceof Error) {
      message = error.message;
    }

    return res.status(500).json({
      error: 'Erro interno no servidor',
      details: message,
    });
  }
});

export default router;
