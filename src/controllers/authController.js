const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const authController = {
  async login(req, res) {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });

      if (!user)
        return res.status(401).json({ error: 'Usuário ou senha inválidos' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(401).json({ error: 'Usuário ou senha inválidos' });

      const token = generateToken(user);

      res.json({
        token,
        user: {
          id: user._id,
          username: user.username,
          nome: user.nome,
        },
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async passwordLost(req, res) {
    try {
      const { username } = req.body;
      const user = await User.findOne({ username });

      if (!user || !user.email) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const token = crypto.randomBytes(20).toString('hex');
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
      await user.save();

      const link = `${process.env.FRONTEND_URL}/resetar?token=${token}`;

      await sendEmail({
        to: user.email,
        subject: 'Recuperação de Senha - Dogs API',
        html: `<p>Olá, ${user.nome}!</p>
               <p>Para redefinir sua senha, clique no link abaixo:</p>
               <p><a href="${link}">${link}</a></p>
               <p>O link expira em 1 hora.</p>`,
      });

      res.json({ message: 'E-mail de recuperação enviado' });
    } catch (error) {
      console.error('Erro no passwordLost:', error);
      res.status(500).json({ error: 'Erro ao enviar e-mail de recuperação' });
    }
  },

  async passwordReset(req, res) {
    try {
      const { password, token } = req.body;

      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({ error: 'Token inválido ou expirado' });
      }

      user.password = await bcrypt.hash(password, 10);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.json({ message: 'Senha redefinida com sucesso' });
    } catch (error) {
      console.error('Erro no passwordReset:', error);
      res.status(500).json({ error: 'Erro ao redefinir senha' });
    }
  },
};

module.exports = authController;
