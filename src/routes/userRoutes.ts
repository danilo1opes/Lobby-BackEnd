import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { authMiddleware, generateToken } from '../middleware/auth'; 

const router = Router();

router.post('/user', async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return res
        .status(400)
        .json({ error: 'Email, username e password são obrigatórios' });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: 'Senha deve ter pelo menos 6 caracteres' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ error: 'Email ou username já existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); 
    const user = new User({ email, username, password: hashedPassword });
    await user.save();

    const token = jwt.sign(
      { id: user._id, username },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' },
    );
    return res.status(201).json({ id: user._id, token });
  } catch (error: any) {
    console.error('Erro no /user:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: 'Username e password são obrigatórios' });
    }

    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: user._id, username },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' },
    );
    return res.status(200).json({ token });
  } catch (error: any) {
    console.error('Erro no /login:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

router.get('/user', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user || !user.id) {
      return res.status(401).json({ error: 'Usuário não possui permissão' });
    }

    const response = {
      id: user.id,
      username: user.username,
      nome: user.nome,
      email: user.email,
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

export default router;
