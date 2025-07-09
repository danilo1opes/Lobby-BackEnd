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

router.post('/password/lost', async (req: Request, res: Response) => {
  try {
    const { login, url } = req.body;
    if (!login) {
      return res.status(406).json({ error: 'Informe o email ou login' });
    }

    const user = await User.findOne({
      $or: [{ email: login }, { username: login }],
    });
    if (!user) {
      return res.status(401).json({ error: 'Usuário não existe' });
    }

    const resetToken = generateResetToken({
      id: user._id,
      username: user.username,
    });
    const resetUrl = `${url}/?key=${resetToken}&login=${encodeURIComponent(
      user.username
    )}`;

    await transporter.sendMail({
      to: user.email,
      subject: 'Password Reset',
      text: `Utilize o link abaixo para resetar a sua senha:\n${resetUrl}`,
    });

    return res.status(200).json('Email enviado');
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// POST /json/password/reset - Reset password
router.post('/password/reset', async (req: Request, res: Response) => {
  try {
    const { login, password, key } = req.body;
    if (!login || !password || !key) {
      return res.status(406).json({ error: 'Dados incompletos' });
    }

    const user = await User.findOne({ username: login });
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

    return res.status(200).json('Senha alterada');
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

export default router;
