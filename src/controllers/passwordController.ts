import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Token from '../models/Token';
import { sendEmail } from '../utils/sendEmail';

export const passwordLost = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hora

    await Token.create({
      token: resetToken,
      user: user._id,
      expiresAt,
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const emailSent = await sendEmail(
      email,
      'Redefinição de Senha - Lobby',
      `Clique no link para redefinir sua senha: ${resetLink}`
    );

    if (!emailSent) {
      return res
        .status(500)
        .json({ error: 'Erro ao enviar e-mail de recuperação' });
    }

    return res.json({ message: 'E-mail de recuperação enviado' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao processar solicitação' });
  }
};

export const passwordReset = async (req: Request, res: Response) => {
  const { token, password } = req.body;
  try {
    const resetToken = await Token.findOne({
      token,
      expiresAt: { $gt: new Date() },
    });
    if (!resetToken)
      return res.status(400).json({ error: 'Token inválido ou expirado' });

    const user = await User.findById(resetToken.user);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    await Token.deleteOne({ _id: resetToken._id });

    return res.json({ message: 'Senha redefinida com sucesso' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao redefinir senha' });
  }
};
