const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { validateUserRegistration } = require('../middleware/validation');

const router = express.Router();

// POST /json/api/user - Criar usuário
router.post('/user', validateUserRegistration, async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Verificar se usuário já existe
    const existingUser = await User.findOne({
      $or: [{ email: email }, { username: username }],
    });

    if (existingUser) {
      return res.status(403).json({
        error: 'Email já cadastrado',
      });
    }

    // Criar usuário
    const user = new User({
      username,
      email,
      password,
      nome: username,
    });

    await user.save();

    res.status(201).json({
      id: user._id,
      username: user.username,
      email: user.email,
      nome: user.nome,
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);

    if (error.code === 11000) {
      // Erro de duplicação do MongoDB
      return res.status(403).json({
        error: 'Email já cadastrado',
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /json/api/user - Obter dados do usuário logado
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    res.json({
      id: user._id,
      username: user.username,
      nome: user.nome,
      email: user.email,
    });
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
