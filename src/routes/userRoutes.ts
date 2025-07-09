import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User, { IUser } from '../models/User';
import { authMiddleware, generateToken } from '../middleware/auth';

const router = Router();

// POST /json/user - Create a new user
router.post('/user', async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(406).json({ error: 'Dados incompletos' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(403).json({ error: 'Email ou username já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      username,
      password: hashedPassword,
      nome: username, // Default nome to username
    });

    await user.save();

    const token = generateToken({
      id: user._id,
      username: user.username,
      nome: user.nome,
      email: user.email,
    });

    return res.status(201).json({ id: user._id, token });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno no servidor' });
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