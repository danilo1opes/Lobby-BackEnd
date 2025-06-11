const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const {
  validateLogin,
  validatePasswordLost,
  validatePasswordReset,
} = require('../middleware/validation');
const { sendPasswordResetEmail } = require('../utils/email');

const router = express.Router();

// POST /json/jwt-auth/v1/token - Login
router.post('/token', validateLogin, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Buscar usuário por username ou email
    const user = await User.findOne({
      $or: [{ username }, { email: username }],
    });

    if (!user) {
      return res.status(401).json({
        error: 'Usuário ou senha incorretos',
      });
    }

    // Verificar senha (supondo que User tenha método comparePassword)
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Usuário ou senha incorretos',
      });
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user_email: user.email,
      user_nicename: user.username,
      user_display_name: user.nome,
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /json/api/password/lost - Recuperar senha
router.post('/password/lost', validatePasswordLost, async (req, res) => {
  try {
    const { login, url } = req.body;

    // Buscar usuário por email ou username
    const user = await User.findOne({
      $or: [{ email: login }, { username: login }],
    });

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não existe',
      });
    }

    // Gerar token de reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hora

    // Salvar token no usuário
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Enviar email
    const resetUrl = `${url}?key=${resetToken}&login=${encodeURIComponent(
      user.username
    )}`;

    try {
      await sendPasswordResetEmail(user.email, resetUrl);
      res.json({ message: 'Email enviado.' });
    } catch (emailError) {
      console.error('Erro ao enviar email:', emailError);
      res.status(500).json({ error: 'Erro ao enviar email' });
    }
  } catch (error) {
    console.error('Erro na recuperação de senha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /json/api/password/reset - Resetar senha
router.post('/password/reset', validatePasswordReset, async (req, res) => {
  try {
    const { login, password, key } = req.body;

    // Buscar usuário por username
    const user = await User.findOne({ username: login });

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não existe',
      });
    }

    // Verificar token e validade
    if (
      user.resetPasswordToken !== key ||
      user.resetPasswordExpires < Date.now()
    ) {
      return res.status(400).json({
        error: 'Token inválido ou expirado',
      });
    }

    // Atualizar senha com hash
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Senha alterada com sucesso.' });
  } catch (error) {
    console.error('Erro no reset de senha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
