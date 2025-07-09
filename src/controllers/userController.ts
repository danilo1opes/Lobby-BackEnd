import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User'; // Importa o modelo User, não userSchema

export const getUser = async (req: Request, res: Response) => {
  console.log('Requisição para /api/user:', req.headers.authorization);
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) return res.status(401).json({ error: 'Token não fornecido' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await User.findById((decoded as any).id); // Usa User
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json({ id: user._id, email: user.email, username: user.username });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  console.log('Requisição para /api/user (POST):', req.body);
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email }); // Usa User
    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword }); // Usa User
    await user.save();
    res.status(201).json({ message: 'Usuário criado com sucesso' });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
};
