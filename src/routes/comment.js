const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Comment = require('../models/Comment');
const User = require('../models/User');

// GET /comment/:id - Obter comentários de uma foto
router.get('/comment/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const comments = await Comment.find({ comment_post_ID: id })
      .sort({ comment_date: -1 })
      .populate('comment_author', 'username nome');

    const formatted = comments.map((c) => ({
      comment_ID: c._id,
      comment_post_ID: c.comment_post_ID,
      comment_author: c.comment_author
        ? c.comment_author.username
        : 'Usuário deletado',
      comment_content: c.comment_content,
      comment_date: c.comment_date,
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /comment/:id - Criar comentário
router.post('/comment/:id', auth, async (req, res) => {
  try {
    const { comment } = req.body;
    const { id } = req.params;

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ error: 'Comentário não pode ser vazio' });
    }

    const newComment = new Comment({
      comment_post_ID: id,
      comment_author: req.user.id, // Use req.user.id para pegar o id do usuário autenticado
      comment_content: comment,
      comment_date: new Date(),
    });

    await newComment.save();

    // Popula o author depois de salvar
    await newComment.populate('comment_author', 'username nome');

    res.status(201).json({
      comment_ID: newComment._id,
      comment_post_ID: newComment.comment_post_ID,
      comment_author: newComment.comment_author.username,
      comment_content: newComment.comment_content,
      comment_date: newComment.comment_date,
    });
  } catch (error) {
    console.error('Erro ao criar comentário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
