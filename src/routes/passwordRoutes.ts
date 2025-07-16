import { Router, Request, Response } from 'express';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { generateResetToken } from '../middleware/auth';
import bcrypt from 'bcryptjs';

const router = Router();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT || '587'),
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

console.log('Transporter config:', transporter.options);

router.post('/password/lost', async (req: Request, res: Response) => {
  try {
    const { login, url } = req.body;
    if (!login) {
      return res.status(406).json({ error: 'Informe o email ou login' });
    }
    if (!url) {
      return res
        .status(406)
        .json({ error: 'URL de redirecionamento é requerida' });
    }

    const user = await User.findOne({
      $or: [{ email: login }, { username: login }],
    });
    if (!user) {
      return res.status(401).json({ error: 'Usuário não existe' });
    }

    const resetToken = generateResetToken({
      id: user._id.toString(),
      username: user.username,
    });
    const resetUrl = `${url}/?key=${resetToken}&login=${encodeURIComponent(
      user.username,
    )}`;

    console.log('Enviando email para:', user.email, 'com URL:', resetUrl);
    await transporter.sendMail({
      to: user.email,
      subject: 'Password Reset',
      text: `Utilize o link abaixo para resetar a sua senha:\n${resetUrl}`,
    });

    console.log(`Email enviado para ${user.email} com token ${resetToken}`);
    return res.status(200).json({ message: 'Email enviado' });
  } catch (error: any) {
    console.error('Erro no /password/lost:', error);
    return res.status(500).json({
      error: 'Erro interno no servidor',
      details:
        process.env.NODE_ENV === 'development'
          ? (error as Error).message
          : undefined,
    });
  }
});

router.post('/password/reset', async (req: Request, res: Response) => {
  try {
    const { login, password, key } = req.body;
    if (!login || !password || !key) {
      return res.status(406).json({ error: 'Dados incompletos' });
    }

    const user = await User.findOne({
      $or: [{ email: login }, { username: login }],
    });
    if (!user) {
      return res.status(401).json({ error: 'Usuário não existe' });
    }

    try {
      jwt.verify(key, process.env.JWT_SECRET || 'fallback_secret');
    } catch (error) {
      return res.status(401).json({ error: 'Token expirado' });
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    console.log(`Senha alterada para usuário ${user.username}`);
    return res.status(200).json({ message: 'Senha alterada' });
  } catch (error: any) {
    console.error('Erro no /password/reset:', error);
    return res.status(500).json({
      error: 'Erro interno no servidor',
      details:
        process.env.NODE_ENV === 'development'
          ? (error as Error).message
          : undefined,
    });
  }
});

export default router;
