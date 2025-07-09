import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User'; // Ajustado para importar User

export const login = async (req: Request, res: Response) => {
  console.log('Requisição para /jwt-auth/v1/token:', req.body);
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '1d' });
    return res.json({ token });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
};

export const validateToken = async (req: Request, res: Response) => {
  console.log('Requisição para /jwt-auth/v1/token/validate:', req.headers.authorization);
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) return res.status(401).json({ error: 'Token não fornecido' });
    jwt.verify(token, process.env.JWT_SECRET!);
    res.json({ valid: true });
  } catch (error) {
    console.error('Erro na validação do token:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
};