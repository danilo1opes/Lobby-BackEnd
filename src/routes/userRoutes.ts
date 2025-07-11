import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { authMiddleware, generateToken } from '../middleware/auth';

const router = Router();

// POST /json/user - Create a new user
router.post('/user', async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return res
        .status(406)
        .json({ error: 'Email, username e password são obrigatórios' });
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
      { expiresIn: '1d' }
    );
    return res.status(201).json({ id: user._id, token });
  } catch (error: any) {
    console.error('Erro no /user:', error);
    return res.status(500).json({
      error: 'Erro interno no servidor',
      details:
        process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// GET /json/user - Fetch authenticated user details
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
