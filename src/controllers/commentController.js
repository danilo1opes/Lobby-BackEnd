const Comment = require('../models/Comment');
const Photo = require('../models/Photo');

class CommentController {
  // Obter comentários de uma foto
  static async list(req, res) {
    try {
      const { id } = req.params;

      // Verificar se a foto existe
      const photo = await Photo.findById(id);
      if (!photo) {
        return res.status(404).json({
          error: 'Foto não encontrada',
        });
      }

      // Buscar comentários
      const comments = await Comment.find({ comment_post_ID: id })
        .sort({ comment_date: -1 })
        .populate('comment_author', 'username nome');

      const formattedComments = comments.map((comment) => ({
        comment_ID: comment._id,
        comment_post_ID: comment.comment_post_ID,
        comment_author: comment.comment_author.username,
        comment_content: comment.comment_content,
        comment_date: comment.comment_date,
      }));

      res.json(formattedComments);
    } catch (error) {
      console.error('Erro ao obter comentários:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Criar novo comentário
  static async create(req, res) {
    try {
      const { id } = req.params;
      const { comment } = req.body;
      const userId = req.user._id;

      // Verificar se a foto existe
      const photo = await Photo.findById(id);
      if (!photo) {
        return res.status(404).json({
          error: 'Foto não encontrada',
        });
      }

      // Criar comentário
      const newComment = new Comment({
        comment_content: comment,
        comment_author: userId,
        comment_post_ID: id,
      });

      await newComment.save();

      // Populate do author antes de retornar
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
  }

  // Deletar comentário
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      const comment = await Comment.findById(id);

      if (!comment) {
        return res.status(404).json({
          error: 'Comentário não encontrado',
        });
      }

      // Verificar se o usuário é o autor do comentário
      if (comment.comment_author.toString() !== userId.toString()) {
        return res.status(403).json({
          error: 'Não autorizado',
        });
      }

      await Comment.findByIdAndDelete(id);

      res.json({ message: 'Comentário deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar comentário:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atualizar comentário
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { comment } = req.body;
      const userId = req.user._id;

      if (!comment || comment.trim().length === 0) {
        return res.status(400).json({
          error: 'Comentário não pode estar vazio',
        });
      }

      if (comment.length > 500) {
        return res.status(400).json({
          error: 'Comentário deve ter no máximo 500 caracteres',
        });
      }

      const existingComment = await Comment.findById(id);

      if (!existingComment) {
        return res.status(404).json({
          error: 'Comentário não encontrado',
        });
      }

      // Verificar se o usuário é o autor do comentário
      if (existingComment.comment_author.toString() !== userId.toString()) {
        return res.status(403).json({
          error: 'Não autorizado',
        });
      }

      // Atualizar comentário
      existingComment.comment_content = comment;
      await existingComment.save();

      await existingComment.populate('comment_author', 'username nome');

      res.json({
        comment_ID: existingComment._id,
        comment_post_ID: existingComment.comment_post_ID,
        comment_author: existingComment.comment_author.username,
        comment_content: existingComment.comment_content,
        comment_date: existingComment.comment_date,
      });
    } catch (error) {
      console.error('Erro ao atualizar comentário:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Obter comentários do usuário logado
  static async getUserComments(req, res) {
    try {
      const userId = req.user._id;
      const _total = parseInt(req.query._total) || 10;
      const _page = parseInt(req.query._page) || 1;

      const skip = (_page - 1) * _total;

      const comments = await Comment.find({ comment_author: userId })
        .sort({ comment_date: -1 })
        .skip(skip)
        .limit(_total)
        .populate('comment_author', 'username nome')
        .populate('comment_post_ID', 'title src');

      const formattedComments = comments.map((comment) => ({
        comment_ID: comment._id,
        comment_post_ID: comment.comment_post_ID._id,
        comment_author: comment.comment_author.username,
        comment_content: comment.comment_content,
        comment_date: comment.comment_date,
        photo: {
          id: comment.comment_post_ID._id,
          title: comment.comment_post_ID.title,
          src: comment.comment_post_ID.src,
        },
      }));

      res.json(formattedComments);
    } catch (error) {
      console.error('Erro ao obter comentários do usuário:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Obter estatísticas de comentários
  static async getStats(req, res) {
    try {
      const userId = req.user._id;

      // Total de comentários do usuário
      const totalComments = await Comment.countDocuments({
        comment_author: userId,
      });

      // Comentários por mês (últimos 6 meses)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const commentsByMonth = await Comment.aggregate([
        {
          $match: {
            comment_author: userId,
            comment_date: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$comment_date' },
              month: { $month: '$comment_date' },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 },
        },
      ]);

      res.json({
        totalComments,
        commentsByMonth,
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas de comentários:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = CommentController;
