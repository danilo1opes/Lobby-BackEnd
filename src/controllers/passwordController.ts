import { Request, Response } from 'express';
import User from '../models/User'; // Ajustado para importar User
import tokenSchema from '../models/Token';
import bcrypt from 'bcryptjs';
import { sendEmail } from '../utils/sendEmail';
import crypto from 'crypto';

export const passwordLost = async (req: Request, res: Response) => {
  console.log('Requisição para /jwt-auth/v1/password/lost:', req.body);
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    const token = crypto.randomBytes(20).toString('hex');
    await tokenSchema.create({
      userId: user._id,
      token,
      createdAt: new Date(),
    });
    const resetLink = `${process.env.FRONTEND_URL}/login/resetar?token=${token}&login=${email}`;
    await sendEmail(
      user.email,
      'Recuperação de Senha',
      `Clique para redefinir sua senha: ${resetLink}`
    );
    res.json({ message: 'E-mail de recuperação enviado' });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    res.status(500).json({ error: 'Erro interno ao processar recuperação' });
  }
};

export const passwordReset = async (req: Request, res: Response) => {
  console.log('Requisição para /jwt-auth/v1/password/reset:', req.body);
  try {
    const { login, key, password } = req.body;
    const token = await tokenSchema.findOne({ token: key, userId: login });
    if (!token) {
      return res.status(400).json({ error: 'Token inválido ou expirado' });
    }
    const user = await User.findById(login);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    await tokenSchema.deleteOne({ token: key });
    res.json({ message: 'Senha redefinida com sucesso' });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ error: 'Erro interno ao redefinir senha' });
  }
};
