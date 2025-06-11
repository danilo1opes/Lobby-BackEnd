const express = require('express');
const fs = require('fs');
const path = require('path');
const Photo = require('../models/Photo');
const Comment = require('../models/Comment');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validatePhoto } = require('../middleware/validation');

const router = express.Router();

// GET /json/api/photo - Listar fotos
router.get('/photo', async (req, res) => {
  try {
    const _total = parseInt(req.query._total) || 6;
    const _page = parseInt(req.query._page) || 1;
    const _user = req.query._user || null;

    let query = {};

    // Filtrar por usuário se especificado
    if (_user) {
      let userId = _user;

      // Se _user não é um ObjectId válido, buscar por username
      if (!_user.match(/^[0-9a-fA-F]{24}$/)) {
        const user = await User.findOne({ username: _user });
        if (user) {
          userId = user._id;
        } else {
          // Se usuário não encontrado, retorna array vazio
          return res.json([]);
        }
      }

      query.author = userId;
    }

    const skip = (_page - 1) * _total;

    const photos = await Photo.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(_total)
      .populate('author', 'username nome');

    // Contar comentários para cada foto
    const photosWithComments = await Promise.all(
      photos.map(async (photo) => {
        const totalComments = await Comment.countDocuments({
          comment_post_ID: photo._id,
        });

        return {
          id: photo._id,
          author: photo.author.username,
          title: photo.title,
          date: photo.createdAt,
          src: `${req.protocol}://${req.get('host')}/${photo.src}`,
          peso: photo.peso,
          idade: photo.idade,
          acessos: photo.acessos,
          total_comments: totalComments,
        };
      })
    );

    res.json(photosWithComments);
  } catch (error) {
    console.error('Erro ao listar fotos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /json/api/photo - Criar nova foto
router.post(
  '/photo',
  authMiddleware, // Usuário precisa estar autenticado
  upload.single('photo'), // Middleware para upload do arquivo 'photo'
  validatePhoto, // Validação dos dados da foto (ex: título, peso, idade)
  async (req, res) => {
    try {
      const { title, peso, idade } = req.body;

      if (!req.file) {
        return res.status(400).json({ error: 'Arquivo da foto é obrigatório' });
      }

      const newPhoto = new Photo({
        title,
        peso,
        idade,
        src: req.file.path.replace(/\\/g, '/'), // Ajustar caminho para URL
        author: req.user.id,
        createdAt: new Date(),
      });

      await newPhoto.save();

      res
        .status(201)
        .json({ message: 'Foto criada com sucesso', photo: newPhoto });
    } catch (error) {
      console.error('Erro ao criar foto:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
);

module.exports = router;
